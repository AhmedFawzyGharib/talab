const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const Driver = require("../models/Driver");
const DriverApplication = require("../models/DriverApplication");
const Otp = require("../models/Otp");

/* ===============================
   LOGIN
================================= */
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        message: "Phone and password are required",
      });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      role: user.role,
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({
      message: "Server error",
    });
  }
};

/* ===============================
   REQUEST DRIVER OTP
================================= */
const requestDriverOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        message: "Phone is required",
      });
    }

    const application =
      await DriverApplication.findOne({
        phone,
        status: "approved",
      });

    if (!application) {
      return res.status(400).json({
        message: "Application not approved",
      });
    }

    // حذف أي OTP قديم
    await Otp.deleteMany({ phone });

    const code = crypto.randomInt(100000, 999999).toString();

    const expiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    ); // 5 دقائق

    await Otp.create({
      phone,
      code,
      expiresAt,
    });

    console.log("OTP CODE:", code); // في الإنتاج يتم إرساله عبر SMS

    res.json({
      message: "OTP sent successfully",
    });

  } catch (err) {
    console.error("REQUEST OTP ERROR:", err);
    res.status(500).json({
      message: "Server error",
    });
  }
};

/* ===============================
   VERIFY OTP + CREATE ACCOUNT
================================= */
const verifyOtpAndSetPassword = async (req, res) => {
  try {
    const { phone, otp, password } = req.body;

    if (!phone || !otp || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingOtp = await Otp.findOne({
      phone,
      code: otp,
    });

    if (!existingOtp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (existingOtp.expiresAt < new Date()) {
      await Otp.deleteMany({ phone });
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    const application =
      await DriverApplication.findOne({
        phone,
        status: "approved",
      });

    if (!application) {
      return res.status(400).json({
        message: "Application not approved",
      });
    }

    const existingUser = await User.findOne({ phone });

    if (existingUser) {
      return res.status(400).json({
        message: "Account already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    /* ===============================
       CREATE USER (WITH NAME)
    ================================= */
    const user = await User.create({
      name: application.fullName,
      phone,
      password: hashedPassword,
      role: "driver",
    });

    /* ===============================
       CREATE DRIVER PROFILE
    ================================= */
    await Driver.create({
      userId: user._id,
      vehicleType: application.vehicleType,
      isOnline: false,

      currentLocation: {
        type: "Point",
        coordinates: [0, 0], // 🔥 حل مشكلة Geo Validation
      },
    });

    // حذف OTP بعد الاستخدام
    await Otp.deleteMany({ phone });

    res.json({
      message: "Account created successfully",
    });

  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({
      message: "Server error",
    });
  }
};

/* ===============================
   CHECK APPLICATION STATUS
================================= */
const checkApplicationStatus = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        message: "Phone is required",
      });
    }

    const application =
      await DriverApplication.findOne({ phone });

    if (!application) {
      return res.json({ status: "none" });
    }

    res.json({ status: application.status });

  } catch (err) {
    console.error("CHECK STATUS ERROR:", err);
    res.status(500).json({
      message: "Server error",
    });
  }
};


/* ===============================
   CREATE ADMIN (DEV ONLY)
================================= */
const createAdmin = async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existing = await User.findOne({ phone });

    if (existing) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      phone,
      password: hashedPassword,
      role: "admin",
    });

    res.json({
      message: "Admin created successfully",
      admin,
    });

  } catch (err) {
    console.error("CREATE ADMIN ERROR:", err);
    res.status(500).json({
      message: "Server error",
    });
  }
};

/* ===============================
   CREATE CUSTOMER (DEV ONLY)
================================= */
const createCustomer = async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existing = await User.findOne({ phone });

    if (existing) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await User.create({
      name,
      phone,
      password: hashedPassword,
      role: "customer",
    });

    res.json({
      message: "Customer created successfully",
      customer,
    });

  } catch (err) {
    console.error("CREATE CUSTOMER ERROR:", err);
    res.status(500).json({
      message: "Server error",
    });
  }
};

/* ===============================
   REGISTER CUSTOMER + SEND OTP
================================= */
const registerCustomer = async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        message: "Phone already registered",
      });
    }

    await Otp.deleteMany({ phone });

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.create({
      phone,
      code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    console.log("CUSTOMER OTP:", code);

    res.json({
      message: "OTP sent successfully",
    });

  } catch (err) {
    console.error("REGISTER CUSTOMER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===============================
   VERIFY CUSTOMER OTP
================================= */
const verifyCustomerOtp = async (req, res) => {
  try {
    const { name, phone, password, otp } = req.body;

    const existingOtp = await Otp.findOne({ phone, code: otp });

    if (!existingOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (existingOtp.expiresAt < new Date()) {
      await Otp.deleteMany({ phone });
      return res.status(400).json({ message: "OTP expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      phone,
      password: hashedPassword,
      role: "customer",
    });

    await Otp.deleteMany({ phone });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });

  } catch (err) {
    console.error("VERIFY CUSTOMER OTP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  login,
  requestDriverOtp,
  createAdmin,
  createCustomer,
  registerCustomer,
  verifyCustomerOtp,
  verifyOtpAndSetPassword,
  checkApplicationStatus,
};