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

    const pendingDrivers = await DriverApplication.countDocuments({
      status: "pending"
    });

    const pendingMerchants = await MerchantApplication.countDocuments({
      status: "pending"
    });

    const revenue = await Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);

    res.json({
      totalDrivers,
      totalMerchants,
      totalOrders,
      pendingDrivers,
      pendingMerchants,
      totalRevenue: revenue[0]?.total || 0
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server Error"
    });

  }
};

/* ===============================
   ORDERS MANAGEMENT
================================= */

const getAllOrders = async (req, res) => {

  try {

    const orders = await Order.find()
      .populate("customer", "name phone")
      .populate("merchant", "name")
      .populate("driver", "name phone")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });

  }

};

const cancelOrder = async (req, res) => {

  try {

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    order.status = "cancelled";

    await order.save();

    res.json({
      message: "Order cancelled"
    });

  } catch (error) {

    res.status(500).json({
      message: "Server Error"
    });

  }

};

const getAvailableDrivers = async (req, res) => {

  try {

    const drivers = await Driver.find()
      .populate("userId", "name phone");

    res.json(drivers);

  } catch (error) {

    res.status(500).json({
      message: "Server Error"
    });

  }

};

const assignDriver = async (req, res) => {

  try {

    const { driverId } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    order.driver = driverId;
    order.status = "accepted";

    await order.save();

    res.json({
      message: "Driver assigned"
    });

  } catch (error) {

    res.status(500).json({
      message: "Server Error"
    });

  }

};

/* ===============================
   DRIVER APPLICATIONS
================================= */

const getDriverApplications = async (req, res) => {

  try {

    const apps = await DriverApplication.find()
      .sort({ createdAt: -1 });

    res.json(apps);

  } catch (err) {

    res.status(500).json({
      message: "Server Error"
    });

  }

};

const updateDriverStatus = async (req, res) => {

  try {

    const { status } = req.body;

    const application = await DriverApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found"
      });
    }

    application.status = status;

    await application.save();

    res.json({
      message: "Status updated"
    });

  } catch (err) {

    res.status(500).json({
      message: "Server Error"
    });

  }

};

/* ===============================
   DRIVERS
================================= */

const getDrivers = async (req, res) => {

  try {

    const drivers = await Driver.find()
      .populate("userId", "-password")
      .sort({ createdAt: -1 });

    res.json(drivers);

  } catch (err) {

    res.status(500).json({
      message: "Server Error"
    });

  }

};

/* ===============================
   MERCHANT APPLICATIONS
================================= */

const getMerchantApplications = async (req, res) => {

  try {

    const apps = await MerchantApplication.find()
      .sort({ createdAt: -1 });

    res.json(apps);

  } catch (err) {

    res.status(500).json({
      message: "Server Error"
    });

  }

};

const updateMerchantStatus = async (req, res) => {

  try {

    const { status } = req.body;

    const application = await MerchantApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: "Not found"
      });
    }

    application.status = status;

    await application.save();

    res.json({
      message: "Merchant status updated"
    });

  } catch (err) {

    res.status(500).json({
      message: "Server Error"
    });

  }

};

/* ===============================
   MERCHANTS CRUD
================================= */

const getMerchants = async (req, res) => {

  try {

    const merchants = await Merchant.find()
      .populate("user", "-password")
      .sort({ createdAt: -1 });

    res.json(merchants);

  } catch (err) {

    res.status(500).json({
      message: "Server Error"
    });

  }

};

const createMerchant = async (req, res) => {

  try {

    const {
      name,
      phone,
      password,
      type,
      description,
      lat,
      lng
    } = req.body;

    const existing = await User.findOne({ phone });

    if (existing) {
      return res.status(400).json({
        message: "User exists"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      phone,
      password: hashed,
      role: "merchant"
    });

    const merchant = await Merchant.create({
      user: user._id,
      name,
      type,
      description,
      location: { lat, lng }
    });

    res.status(201).json(merchant);

  } catch (err) {

    res.status(500).json({
      message: "Server Error"
    });

  }

};

const deleteMerchant = async (req, res) => {

  try {

    await Merchant.findByIdAndDelete(req.params.id);

    res.json({
      message: "Merchant deleted"
    });

  } catch (err) {

    res.status(500).json({
      message: "Server Error"
    });

  }

};

const toggleMerchantStatus = async (req, res) => {

  try {

    const merchant = await Merchant.findById(req.params.id);

    merchant.isActive = !merchant.isActive;

    await merchant.save();

    res.json(merchant);

  } catch (err) {

    res.status(500).json({
      message: "Server Error"
    });

  }

};

/* ===============================
   PRODUCTS
================================= */

const createProduct = async (req, res) => {

  try {

    const product = await Product.create({
      ...req.body,
      image: req.file?.filename
    });

    res.status(201).json(product);

  } catch (error) {

    res.status(500).json({
      message: "Server Error"
    });

  }

};

const getProducts = async (req, res) => {

  try {

    const products = await Product.find()
      .populate("merchantId");

    res.json(products);

  } catch (error) {

    res.status(500).json({
      message: "Server Error"
    });

  }

};

const deleteProduct = async (req, res) => {

  try {

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      message: "Product deleted"
    });

  } catch (error) {

    res.status(500).json({
      message: "Server Error"
    });

  }

};

const toggleProductStatus = async (req, res) => {

  try {

    const product = await Product.findById(req.params.id);

    product.isAvailable = !product.isAvailable;

    await product.save();

    res.json(product);

  } catch (error) {

    res.status(500).json({
      message: "Server Error"
    });

  }

};

/* ===============================
   WITHDRAW
================================= */

const getWithdrawRequests = async (req, res) => {

  try {

    const requests = await WithdrawRequest.find()
      .populate("driver")
      .sort({ createdAt: -1 });

    res.json(requests);

  } catch (error) {

    res.status(500).json({
      message: "Server Error"
    });

  }

};

const updateWithdrawStatus = async (req, res) => {

  try {

    const { status } = req.body;

    const request = await WithdrawRequest.findById(req.params.id);

    request.status = status;

    await request.save();

    res.json({
      message: `Withdraw ${status}`
    });

  } catch (error) {

    res.status(500).json({
      message: "Server Error"
    });

  }

};

/* ===============================
   EXPORTS
================================= */

module.exports = {

  getDashboardStats,

  getAllOrders,
  cancelOrder,
  getAvailableDrivers,
  assignDriver,

  getDriverApplications,
  updateDriverStatus,
  getDrivers,

  getMerchantApplications,
  updateMerchantStatus,

  getMerchants,
  createMerchant,
  deleteMerchant,
  toggleMerchantStatus,

  createProduct,
  getProducts,
  deleteProduct,
  toggleProductStatus,

  getWithdrawRequests,
  updateWithdrawStatus

};