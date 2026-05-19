export const NAV_SECTIONS = [
  {
    title: "Overview",
    items: [
      { to: "/", label: "Dashboard", icon: "📊", end: true },
      { to: "/analytics", label: "Analytics", icon: "📈" },
    ],
  },
  {
    title: "Operations",
    items: [
      { to: "/orders", label: "Orders", icon: "📋" },
      { to: "/live-orders", label: "Live Orders", icon: "⚡" },
      { to: "/dispatch-map", label: "Dispatch Map", icon: "🗺" },
    ],
  },
  {
    title: "Drivers",
    items: [
      { to: "/drivers", label: "Drivers", icon: "🚚" },
      { to: "/driver-applications", label: "Applications", icon: "🧾" },
      { to: "/drivers-map", label: "Drivers Map", icon: "📍" },
    ],
  },
  {
    title: "Catalog",
    items: [
      { to: "/merchants", label: "Merchants", icon: "🏬" },
      { to: "/merchant-applications", label: "Applications", icon: "🏪" },
      { to: "/products", label: "Products", icon: "📦" },
    ],
  },
  {
    title: "Finance",
    items: [
      { to: "/withdraws", label: "Withdraw Requests", icon: "💰" },
    ],
  },
  {
    title: "Admin",
    items: [
      { to: "/create-user", label: "Create User", icon: "👤" },
      { to: "/blocked-emails", label: "Blocked Emails", icon: "🚫" },
    ],
  },
];
