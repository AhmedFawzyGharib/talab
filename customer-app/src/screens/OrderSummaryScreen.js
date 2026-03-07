import React, { useEffect, useState, useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import api from "../api/api";
import { CartContext } from "../context/CartContext";

export default function OrderSummaryScreen({ route, navigation }) {
  const { items, location, address } = route.params;
  const { clearCart } = useContext(CartContext);

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    loadPreview();
  }, []);

  const loadPreview = async () => {
    try {
      const res = await api.post("/orders/preview", {
        items: items.map((item) => ({ productId: item._id, quantity: item.quantity })),
        deliveryLocation: location,
      });
      setPreview(res.data);
    } catch (error) {
      console.log("PREVIEW ERROR:", error.response?.data ?? error.message);
      alert("Error loading order preview.");
    } finally {
      setLoading(false);
    }
  };

  const confirmOrder = async () => {
    try {
      setConfirming(true);

      const res = await api.post("/orders", {
        items: items.map((item) => ({ productId: item._id, quantity: item.quantity })),
        deliveryLocation: location,
        deliveryAddress: address,
      });

      clearCart();

      navigation.replace("Tracking", {
        order: res.data,
        customerId: res.data.customer,
      });
    } catch (error) {
      console.log("CONFIRM ORDER ERROR:", error.response?.data ?? error.message);
      alert("Error creating order. Please try again.");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      {/* Overlay عند تأكيد الطلب */}
      {confirming && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: "#fff", marginTop: 10 }}>Placing your order...</Text>
        </View>
      )}

      <Text style={styles.title}>Order Summary</Text>

      <Text>Address: {address}</Text>
      <Text>Distance: {preview?.distance?.toFixed(2) ?? 0} km</Text>
      <Text>ETA: {preview?.eta ?? 0} min</Text>
      <Text>Subtotal: {preview?.subtotal ?? 0} SAR</Text>
      <Text>Delivery Fee: {preview?.deliveryFee?.toFixed(2) ?? 0} SAR</Text>
      <Text style={styles.total}>
        Total: {preview?.totalPrice?.toFixed(2) ?? 0} SAR
      </Text>

      <TouchableOpacity style={styles.confirmButton} onPress={confirmOrder} disabled={confirming}>
        <Text style={styles.buttonText}>Confirm Order</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  total: { fontSize: 18, fontWeight: "bold", marginTop: 10 },
  confirmButton: {
    marginTop: 20,
    backgroundColor: "#2ecc71",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});