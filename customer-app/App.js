import React from "react";
import { AuthProvider } from "./src/context/AuthContext";
import { CartProvider } from "./src/context/CartContext";
import Navigation from "./src/navigation";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Navigation />
      </CartProvider>
    </AuthProvider>
  );
}