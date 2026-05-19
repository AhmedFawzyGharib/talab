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
    const { type, subCategory } = req.query;
    const filter = { isActive: true };

    if (type) {
      const allowedTypes = ["restaurant", "market", "pharmacy", "store", "clothing"];
      const requested = String(type)
        .split(",")
        .map((t) => t.trim())
        .filter((t) => allowedTypes.includes(t));

      if (requested.length === 0) {
        return res.status(400).json({ message: "Invalid type filter" });
      }
      filter.type = { $in: requested };
    }

    if (subCategory && typeof subCategory === "string") {
      const trimmed = subCategory.trim();
      if (trimmed.length > 0 && trimmed.length <= 40) {
        filter.subCategory = trimmed;
      }
    }

    const merchants = await Merchant.find(filter);
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