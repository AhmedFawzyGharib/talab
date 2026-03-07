const Order = require("../models/Order");
const User = require("../models/User");
const Driver = require("../models/Driver");
const DriverApplication = require("../models/DriverApplication");
const MerchantApplication = require("../models/MerchantApplication");
const Merchant = require("../models/Merchant");
const WithdrawRequest = require("../models/WithdrawRequest");
const Product = require("../models/Product");
const bcrypt = require("bcryptjs");

/* ===============================
   Dashboard Stats
================================= */
const getDashboardStats = async (req, res) => {
  try {
    const totalDrivers = await Driver.countDocuments();
    const totalMerchants = await Merchant.countDocuments();
    const totalOrders = await Order.countDocuments();

    const pendingDrivers =
      await DriverApplication.countDocuments({
        status: "pending",
      });

    const pendingMerchants =
      await MerchantApplication.countDocuments({
        status: "pending",
      });

    const revenue = await Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    res.json({
      totalDrivers,
      totalMerchants,
      totalOrders,
      pendingDrivers,
      pendingMerchants,
      totalRevenue: revenue[0]?.total || 0,
    });
  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ===============================
   Driver Applications
================================= */
const getDriverApplications = async (req, res) => {
  try {
    const apps = await DriverApplication.find().sort({
      createdAt: -1,
    });

    res.json(apps);
  } catch (err) {
    console.error("GET DRIVER APPS ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

const updateDriverStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application =
      await DriverApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    application.status = status;
    await application.save();

    if (status === "approved") {
      const io = req.app.get("io");
      const onlineDrivers =
        req.app.get("onlineDrivers");

      const socketId =
        onlineDrivers[application.phone];

      if (socketId) {
        io.to(socketId).emit(
          "driverApproved",
          { phone: application.phone }
        );
      }
    }

    res.json({ message: "Updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
    });
  }
};

/* ===============================
   Approved Drivers
================================= */
const getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find()
      .populate("userId", "-password")
      .sort({ createdAt: -1 });

    res.json(drivers);
  } catch (err) {
    console.error("GET DRIVERS ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ===============================
   Merchant Applications
================================= */
const getMerchantApplications = async (req, res) => {
  try {
    const apps = await MerchantApplication.find().sort({
      createdAt: -1,
    });

    res.json(apps);
  } catch (err) {
    console.error("GET MERCHANT APPS ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

const updateMerchantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application =
      await MerchantApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        message: "Not found",
      });
    }

    application.status = status;
    await application.save();

    res.json({
      message: "Merchant status updated",
    });
  } catch (err) {
    console.error("UPDATE MERCHANT ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ===============================
   Merchants Management
================================= */

const getMerchants = async (req, res) => {
  try {
    const merchants = await Merchant.find()
      .populate("user", "-password")
      .sort({ createdAt: -1 });

    res.json(merchants);
  } catch (err) {
    console.error("GET MERCHANTS ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ===============================
   CREATE MERCHANT (Admin)
================================= */

const createMerchant = async (req, res) => {
  try {

    const {
      name,
      phone,
      password,
      type,
      image,
      description,
      lat,
      lng
    } = req.body;

    // تحقق من وجود المستخدم
    const existingUser = await User.findOne({ phone });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء حساب المستخدم
    const user = await User.create({
      name,
      phone,
      password: hashedPassword,
      role: "merchant",
    });

    // إنشاء ملف التاجر
    const merchant = await Merchant.create({
      user: user._id,
      name,
      type,
      image,
      description,
      location: {
        lat,
        lng,
      },
    });

    res.status(201).json(merchant);

  } catch (err) {

    console.error("CREATE MERCHANT ERROR:", err);

    res.status(500).json({
      message: "Server Error",
    });

  }
};
const updateMerchant = async (req, res) => {
  try {
    const merchant =
      await Merchant.findById(req.params.id);

    if (!merchant) {
      return res.status(404).json({
        message: "Merchant not found",
      });
    }

    Object.assign(merchant, req.body);

    await merchant.save();

    res.json(merchant);

  } catch (err) {
    console.error("UPDATE MERCHANT ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

const deleteMerchant = async (req, res) => {
  try {
    const merchant =
      await Merchant.findById(req.params.id);

    if (!merchant) {
      return res.status(404).json({
        message: "Merchant not found",
      });
    }

    await merchant.deleteOne();

    res.json({
      message: "Merchant deleted",
    });

  } catch (err) {
    console.error("DELETE MERCHANT ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

const toggleMerchantStatus = async (req, res) => {
  try {
    const merchant =
      await Merchant.findById(req.params.id);

    if (!merchant) {
      return res.status(404).json({
        message: "Merchant not found",
      });
    }

    merchant.isActive = !merchant.isActive;

    await merchant.save();

    res.json(merchant);

  } catch (err) {
    console.error("TOGGLE MERCHANT ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ===============================
   Product Management
================================= */

const createProduct = async (req, res) => {
  try {

    const {
      name,
      price,
      quantity,
      description,
      merchantId
    } = req.body;

    const image = req.file
      ? req.file.filename
      : null;

    const product = await Product.create({

      name,
      price,
      quantity,
      description,
      merchantId,
      image

    });

    res.status(201).json(product);

  } catch (err) {

    console.error("CREATE PRODUCT ERROR:", err);

    res.status(500).json({
      message: "Server Error",
    });

  }
};

/* ===============================
   GET PRODUCTS
================================= */

const getProducts = async (req, res) => {
  try {

    const products = await Product.find()
      .populate("merchantId")
      .sort({ createdAt: -1 });

    res.json(products);

  } catch (err) {

    console.error("GET PRODUCTS ERROR:", err);

    res.status(500).json({
      message: "Server Error",
    });

  }
};

const updateProduct = async (req, res) => {
  try {
    const product =
      await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    Object.assign(product, req.body);

    await product.save();

    res.json(product);

  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product =
      await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    await product.deleteOne();

    res.json({
      message: "Product deleted",
    });

  } catch (err) {
    console.error("DELETE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

const toggleProductStatus = async (req, res) => {
  try {
    const product =
      await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    product.isAvailable = !product.isAvailable;

    await product.save();

    res.json(product);

  } catch (err) {
    console.error("TOGGLE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ===============================
   Withdraw
================================= */
const getWithdrawRequests = async (req, res) => {
  try {
    const requests = await WithdrawRequest.find()
      .populate("driver")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error("GET WITHDRAW ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

const updateWithdrawStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request =
      await WithdrawRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        message: "Not found",
      });
    }

    request.status = status;
    await request.save();

    res.json({
      message: `Withdraw ${status}`,
    });
  } catch (err) {
    console.error("WITHDRAW UPDATE ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ===============================
   EXPORTS
================================= */
module.exports = {
  getDashboardStats,
  getDriverApplications,
  updateDriverStatus,
  getDrivers,
  getMerchantApplications,
  updateMerchantStatus,

  getMerchants,
  createMerchant,
  updateMerchant,
  deleteMerchant,
  toggleMerchantStatus,

  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  toggleProductStatus,

  getWithdrawRequests,
  updateWithdrawStatus,
};