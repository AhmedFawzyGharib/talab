const Product = require("../models/Product");

/* ===============================
   CREATE PRODUCT
================================= */
exports.createProduct = async (req, res) => {
  try {

    const product = await Product.create({
      merchantId: req.body.merchantId,
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      image: req.body.image
    });

    res.status(201).json(product);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ===============================
   GET PRODUCTS BY MERCHANT
================================= */
exports.getProductsByMerchant = async (req, res) => {
  try {

    const products = await Product.find({
      merchantId: req.params.merchantId,
      isAvailable: true
    });

    res.json(products);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};