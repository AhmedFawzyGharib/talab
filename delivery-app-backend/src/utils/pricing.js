function calculateDynamicPrice(distance, demandFactor = 1) {

  const baseFee = 5;

  const pricePerKm = 2;

  let price = baseFee + distance * pricePerKm;

  if (demandFactor > 1) {
    price *= demandFactor;
  }

  return Math.round(price * 100) / 100;

}

module.exports = {
  calculateDynamicPrice
};