function hasMongoOperator(value) {
  if (value === null || typeof value !== "object") return false;
  for (const key of Object.keys(value)) {
    if (key.startsWith("$") || key.includes(".")) return true;
    if (hasMongoOperator(value[key])) return true;
  }
  return false;
}

module.exports = (req, res, next) => {
  if (hasMongoOperator(req.body) || hasMongoOperator(req.query) || hasMongoOperator(req.params)) {
    return res.status(400).json({ message: "Invalid request payload" });
  }
  next();
};
