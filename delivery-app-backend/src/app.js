const express = require("express");
const cors = require("cors");

const app = express();

require("dotenv").config();

/* ===============================
   Middlewares
================================= */
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
/* ===============================
   Routes
================================= */
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/drivers", require("./routes/driver.routes"));
app.use("/api/merchants", require("./routes/merchant.routes"));
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/driver", require("./routes/driverApplication.routes"));

// Admin Routes
app.use("/api/admin", require("./routes/admin.routes"));

/* ===============================
   404 Handler
================================= */
app.use((req, res, next) => {
  res.status(404).json({
    message: "Route Not Found",
  });
});

/* ===============================
   Global Error Handler
================================= */
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;