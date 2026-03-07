const Merchant = require("../models/Merchant");

// إنشاء شريك (Admin فقط)
exports.createMerchant = async (req, res) => {
  try {
    const merchant = await Merchant.create(req.body);
    res.status(201).json(merchant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// جلب كل الشركاء (للعميل)
exports.getMerchants = async (req, res) => {
  try {
    const merchants = await Merchant.find({ isActive: true });
    res.json(merchants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// جلب شريك واحد
exports.getMerchantById = async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.params.id);
    if (!merchant)
      return res.status(404).json({ message: "Merchant not found" });

    res.json(merchant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};