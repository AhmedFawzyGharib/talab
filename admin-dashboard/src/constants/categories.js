export const MERCHANT_TYPES = [
  { value: "market", label: "🛒 Market", color: "indigo" },
  { value: "restaurant", label: "🍔 Restaurant / Café", color: "amber" },
  { value: "pharmacy", label: "💊 Pharmacy", color: "emerald" },
  { value: "clothing", label: "👕 Clothing", color: "pink" },
  { value: "store", label: "🏬 General Store", color: "gray" },
];

export const SUB_CATEGORIES = {
  clothing: [
    { value: "men", label: "Men" },
    { value: "women", label: "Women" },
    { value: "kids", label: "Kids" },
  ],
  restaurant: [
    { value: "fast_food", label: "Fast Food" },
    { value: "egyptian", label: "Egyptian" },
    { value: "pizza", label: "Pizza" },
    { value: "drinks", label: "Drinks" },
    { value: "desserts", label: "Desserts" },
  ],
  market: [
    { value: "grocery", label: "Grocery" },
    { value: "electronics", label: "Electronics" },
    { value: "home", label: "Home" },
  ],
  pharmacy: [
    { value: "medicine", label: "Medicine" },
    { value: "cosmetics", label: "Cosmetics" },
    { value: "baby", label: "Baby Care" },
  ],
};

export const typeBadgeClass = (type) => {
  const map = {
    market: "bg-indigo-100 text-indigo-700",
    restaurant: "bg-amber-100 text-amber-700",
    pharmacy: "bg-emerald-100 text-emerald-700",
    clothing: "bg-pink-100 text-pink-700",
    store: "bg-gray-100 text-gray-700",
  };
  return map[type] || "bg-gray-100 text-gray-700";
};
