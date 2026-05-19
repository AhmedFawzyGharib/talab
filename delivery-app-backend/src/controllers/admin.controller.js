const Order = require("../models/Order");
const User = require("../models/User");
const Driver = require("../models/Driver");
const DriverApplication = require("../models/DriverApplication");
const MerchantApplication = require("../models/MerchantApplication");
const Merchant = require("../models/Merchant");
const WithdrawRequest = require("../models/WithdrawRequest");
const Product = require("../models/Product");
const BlockedEmail = require("../models/BlockedEmail");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^01[0125]\d{8}$/;

/* ===============================
   Dashboard Stats
================================= */

const getDashboardStats = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      totalDrivers,
      totalMerchants,
      totalOrders,
      pendingDrivers,
      pendingMerchants,
      ordersToday,
      revenueAgg,
      revenueTodayAgg,
      ordersByStatus,
      merchantsByType,
      revenueByDay,
      recentOrders,
    ] = await Promise.all([
      Driver.countDocuments(),
      Merchant.countDocuments(),
      Order.countDocuments(),
      DriverApplication.countDocuments({ status: "pending" }),
      MerchantApplication.countDocuments({ status: "pending" }),
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
      Order.aggregate([
        { $match: { status: "delivered" } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      Order.aggregate([
        {
          $match: {
            status: "delivered",
            createdAt: { $gte: startOfToday },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Merchant.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        {
          $match: {
            status: "delivered",
            createdAt: { $gte: sevenDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            revenue: { $sum: "$totalPrice" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate("customer", "name phone")
        .lean(),
    ]);

    const statusCounts = ordersByStatus.reduce((acc, s) => {
      acc[s._id] = s.count;
      return acc;
    }, {});

    const typeCounts = merchantsByType.map((t) => ({
      type: t._id || "unknown",
      count: t.count,
    }));

    // Fill missing days in revenueByDay
    const dayMap = revenueByDay.reduce((acc, d) => {
      acc[d._id] = d;
      return acc;
    }, {});
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      last7Days.push({
        date: key,
        revenue: dayMap[key]?.revenue || 0,
        orders: dayMap[key]?.orders || 0,
      });
    }

    res.json({
      totalDrivers,
      totalMerchants,
      totalOrders,
      pendingDrivers,
      pendingMerchants,
      ordersToday,
      totalRevenue: revenueAgg[0]?.total || 0,
      revenueToday: revenueTodayAgg[0]?.total || 0,
      ordersByStatus: statusCounts,
      merchantsByType: typeCounts,
      revenueByDay: last7Days,
      recentOrders: recentOrders.map((o) => ({
        _id: o._id,
        status: o.status,
        totalPrice: o.totalPrice,
        type: o.type,
        createdAt: o.createdAt,
        customerName: o.customer?.name || null,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
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
      subCategory,
      description,
      lat,
      lng
    } = req.body;

    const allowedTypes = ["restaurant", "market", "pharmacy", "store", "clothing"];
    if (type && !allowedTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid merchant type" });
    }

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

    const merchantDoc = {
      user: user._id,
      name,
      type,
      description,
      location: { lat, lng },
    };
    if (subCategory && typeof subCategory === "string" && subCategory.trim()) {
      merchantDoc.subCategory = subCategory.trim();
    }

    const merchant = await Merchant.create(merchantDoc);

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
   BLOCKED EMAILS
================================= */

const getBlockedEmails = async (req, res) => {
  try {
    const emails = await BlockedEmail.find().sort({ blockedAt: -1 });
    res.json(emails);
  } catch (err) {
    console.error("GET BLOCKED EMAILS ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

const blockEmail = async (req, res) => {
  try {
    const { email, reason } = req.body;

    if (typeof email !== "string" || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const normalized = email.trim().toLowerCase();

    const existing = await BlockedEmail.findOne({ email: normalized });
    if (existing) {
      return res.status(400).json({ message: "Email already blocked" });
    }

    const doc = await BlockedEmail.create({
      email: normalized,
      reason: typeof reason === "string" ? reason.trim() : undefined,
    });

    res.status(201).json(doc);
  } catch (err) {
    console.error("BLOCK EMAIL ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

const unblockEmail = async (req, res) => {
  try {
    const deleted = await BlockedEmail.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json({ message: "Email unblocked" });
  } catch (err) {
    console.error("UNBLOCK EMAIL ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ===============================
   USERS (super_admin)
================================= */

const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("GET USERS ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

const createUserByAdmin = async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;

    if (typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (typeof phone !== "string" || !PHONE_REGEX.test(phone)) {
      return res
        .status(400)
        .json({ message: "Phone must be 11 digits starting with 010/011/012/015" });
    }
    if (email && (typeof email !== "string" || !EMAIL_REGEX.test(email))) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const allowedRoles = ["admin", "driver", "merchant", "customer"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(400).json({ message: "Phone already in use" });
    }

    const generatedPassword = crypto.randomBytes(6).toString("base64").slice(0, 10);
    const hashed = await bcrypt.hash(generatedPassword, 10);

    const user = await User.create({
      name: name.trim(),
      phone,
      email: email ? email.trim().toLowerCase() : undefined,
      password: hashed,
      role,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email || null,
      role: user.role,
      generatedPassword,
    });
  } catch (err) {
    console.error("CREATE USER ERROR:", err);
    res.status(500).json({ message: "Server Error" });
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
  updateWithdrawStatus,

  getBlockedEmails,
  blockEmail,
  unblockEmail,

  getUsers,
  createUserByAdmin,
};