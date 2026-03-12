const Order = require("../models/Order");
const Product = require("../models/Product");

/* ===============================
   Distance Calculation
================================= */

function calculateDistance(lat1, lon1, lat2, lon2) {

  const R = 6371;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;

}

/* ===============================
   Dynamic Pricing
================================= */

function calculateDeliveryFee(distance) {

  const baseFee = 5;

  const pricePerKm = 2;

  const surgeMultiplier = 1;

  return Math.max(
    baseFee,
    distance * pricePerKm * surgeMultiplier
  );

}

/* =================================
   CREATE ORDER (Merchant Order)
================================= */

exports.createOrder = async (req, res) => {

  try {

    const {
      items,
      deliveryLocation,
      deliveryAddress,
      merchant
    } = req.body;

    let processedItems = [];

    let subtotal = 0;

    for (let item of items) {

      const product = await Product
        .findById(item.productId)
        .populate("merchantId");

      if (!product) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      if (!product.isAvailable) {
        return res.status(400).json({
          message: "Product not available"
        });
      }

      if (!product.merchantId.isActive) {
        return res.status(400).json({
          message: "Merchant is closed"
        });
      }

      const itemTotal =
        product.price * item.quantity;

      subtotal += itemTotal;

      processedItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        total: itemTotal
      });

    }

    const deliveryFee = 10;

    const totalPrice = subtotal + deliveryFee;

    const order = new Order({

      customer: req.user._id,

      merchant,

      items: processedItems,

      subtotal,

      deliveryFee,

      totalPrice,

      type: "merchant",

      deliveryLocation: {
        type: "Point",
        coordinates: [
          deliveryLocation.longitude,
          deliveryLocation.latitude
        ]
      },

      deliveryAddress,

      status: "pending",

      timeline: [
        {
          status: "pending",
          time: new Date()
        }
      ]

    });

    await order.save();

    /* ===============================
       Notify Drivers
    =============================== */

    const io = req.app.get("io");
    const onlineDrivers = req.app.get("onlineDrivers");

    for (const driverId in onlineDrivers) {

      io.to(onlineDrivers[driverId]).emit(
        "newOrder",
        order
      );

    }

    res.status(201).json(order);

  } catch (error) {

    console.error("CREATE ORDER ERROR:", error);

    res.status(500).json({
      message: "Error creating order"
    });

  }

};

/* =================================
   CREATE CUSTOM DELIVERY
================================= */

exports.createCustomDelivery = async (req, res) => {

  try {

    const {
      pickupName,
      note,
      pickupLocation,
      deliveryLocation,
      deliveryAddress
    } = req.body;

    const distance = calculateDistance(

      pickupLocation.latitude,
      pickupLocation.longitude,

      deliveryLocation.latitude,
      deliveryLocation.longitude

    );

    const deliveryFee =
      calculateDeliveryFee(distance);

    const order = new Order({

      customer: req.user._id,

      type: "custom",

      pickups: [
        {
          name: pickupName,
          note,
          location: {
            type: "Point",
            coordinates: [
              pickupLocation.longitude,
              pickupLocation.latitude
            ]
          }
        }
      ],

      deliveryLocation: {
        type: "Point",
        coordinates: [
          deliveryLocation.longitude,
          deliveryLocation.latitude
        ]
      },

      deliveryAddress,

      distance: distance.toFixed(2),

      deliveryFee,

      totalPrice: deliveryFee,

      status: "pending",

      timeline: [
        {
          status: "pending",
          time: new Date()
        }
      ]

    });

    await order.save();

    /* ===============================
       Notify Drivers
    =============================== */

    const io = req.app.get("io");
    const onlineDrivers = req.app.get("onlineDrivers");

    for (const driverId in onlineDrivers) {

      io.to(onlineDrivers[driverId]).emit(
        "newOrder",
        order
      );

    }

    res.status(201).json(order);

  } catch (error) {

    console.log("CUSTOM ORDER ERROR:", error);

    res.status(500).json({
      message: "Error creating custom delivery"
    });

  }

};

/* =================================
   GET MY ORDERS (Customer)
================================= */

exports.getMyOrders = async (req, res) => {

  try {

    const orders = await Order.find({
      customer: req.user._id
    })
      .populate("merchant")
      .populate("driver")
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (error) {

    res.status(500).json({
      message: "Error loading orders"
    });

  }

};

/* =================================
   GET AVAILABLE ORDERS (Driver)
================================= */

exports.getAvailableOrders = async (req, res) => {

  try {

    const orders = await Order.find({

      status: "pending",

      driver: null

    })
      .populate("merchant")
      .populate("customer")
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (error) {

    res.status(500).json({
      message: "Error fetching orders"
    });

  }

};

/* =================================
   ACCEPT ORDER
================================= */

exports.acceptOrder = async (req, res) => {

  try {

    const { id } = req.params;

    const order = await Order.findOneAndUpdate(

      {
        _id: id,
        status: "pending",
        driver: null
      },

      {
        status: "accepted",
        driver: req.user._id
      },

      { new: true }

    );

    if (!order) {

      return res.status(400).json({
        message: "Order already taken"
      });

    }

    order.timeline.push({
      status: "accepted",
      time: new Date()
    });

    await order.save();

    res.json(order);

  } catch (error) {

    res.status(500).json({
      message: "Error accepting order"
    });

  }

};

/* =================================
   UPDATE ORDER STATUS
================================= */

exports.updateOrderStatus = async (req, res) => {

  try {

    const { id } = req.params;

    const { status } = req.body;

    const allowedTransitions = {

      accepted: "picked",

      picked: "on_the_way",

      on_the_way: "delivered"

    };

    const order = await Order.findById(id)
      .populate("customer")
      .populate("merchant")
      .populate("items.product");

    if (!order) {

      return res.status(404).json({
        message: "Order not found"
      });

    }

    if (order.driver.toString() !== req.user._id.toString()) {

      return res.status(403).json({
        message: "Not your order"
      });

    }

    const expectedNext =
      allowedTransitions[order.status];

    if (status !== expectedNext) {

      return res.status(400).json({
        message: `Next expected: ${expectedNext}`
      });

    }

    order.status = status;

    order.timeline.push({
      status,
      time: new Date()
    });

    if (status === "delivered") {

      const platformFee =
        order.totalPrice * 0.1;

      order.platformFee = platformFee;

      order.driverEarnings =
        order.totalPrice - platformFee;

    }

    await order.save();

    res.json(order);

  } catch (error) {

    res.status(500).json({
      message: "Error updating order"
    });

  }

};

/* =================================
   GET ACTIVE DRIVER ORDER
================================= */

exports.getActiveDriverOrder = async (req, res) => {

  try {

    const order = await Order.findOne({

      driver: req.user._id,

      status: {
        $in: [
          "accepted",
          "picked",
          "on_the_way"
        ]
      }

    })
      .populate("merchant")
      .populate("customer")
      .populate("items.product");

    res.json(order);

  } catch (error) {

    res.status(500).json({
      message: "Error loading active order"
    });

  }

};