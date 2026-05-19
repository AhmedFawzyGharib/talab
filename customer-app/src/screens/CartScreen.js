import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";

import { CartContext } from "../context/CartContext";
import api from "../api/api";

export default function CartScreen({ navigation, route }) {
  const {
    cartItems,
    clearCart,
    updateQuantity,
    removeFromCart,
    deliveryLocation,
    setDeliveryLocation,
  } = useContext(CartContext);

  const merchantId = route?.params?.merchantId;
  const [submitting, setSubmitting] = useState(false);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const deliveryFee = 10;
  const total = subtotal + deliveryFee;

  const handleConfirmOrder = async () => {
    if (!cartItems.length) return Alert.alert("Cart is empty");
    if (!deliveryLocation)
      return Alert.alert("Please select delivery location");
    if (!merchantId) return Alert.alert("Merchant missing");

    setSubmitting(true);
    try {
      await api.post("/orders", {
        merchant: merchantId,
        items: cartItems.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
        })),
        deliveryLocation: {
          latitude: deliveryLocation.latitude,
          longitude: deliveryLocation.longitude,
        },
        deliveryAddress: "Selected Location",
      });
      clearCart();
      navigation.navigate("MyOrders");
    } catch (error) {
      console.log("ORDER ERROR:", error.response?.data);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Error creating order"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const confirmRemove = (item) => {
    Alert.alert("Remove item", `Remove ${item.name} from cart?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeFromCart(item._id),
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.unitPrice}>{item.price} SAR / each</Text>
      </View>

      <View style={styles.qtyRow}>
        <TouchableOpacity
          style={styles.qtyButton}
          onPress={() => updateQuantity(item._id, -1)}
        >
          <Text style={styles.qtyButtonText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.qtyText}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.qtyButton}
          onPress={() => updateQuantity(item._id, 1)}
        >
          <Text style={styles.qtyButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.itemRight}>
        <Text style={styles.lineTotal}>{item.price * item.quantity} SAR</Text>
        <TouchableOpacity onPress={() => confirmRemove(item)}>
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15, paddingBottom: 10 }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text style={styles.empty}>Your cart is empty</Text>
          </View>
        }
      />

      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{subtotal} SAR</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={styles.summaryValue}>{deliveryFee} SAR</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{total} SAR</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.locationButton,
              deliveryLocation && styles.locationButtonActive,
            ]}
            onPress={() =>
              navigation.navigate("SelectLocation", {
                onSelect: (location) => setDeliveryLocation(location),
              })
            }
          >
            <Text
              style={[
                styles.locationButtonText,
                deliveryLocation && styles.locationButtonTextActive,
              ]}
            >
              {deliveryLocation
                ? "✔ Location selected — change?"
                : "📍 Select Delivery Location"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.confirmButton, submitting && { opacity: 0.7 }]}
            onPress={handleConfirmOrder}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmText}>Confirm Order</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f4f8" },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  name: { fontWeight: "700", fontSize: 15, color: "#1f2937" },
  unitPrice: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
  },
  qtyButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyButtonText: {
    color: "#4f46e5",
    fontWeight: "bold",
    fontSize: 18,
  },
  qtyText: {
    marginHorizontal: 10,
    fontSize: 15,
    fontWeight: "700",
    color: "#1f2937",
    minWidth: 20,
    textAlign: "center",
  },
  itemRight: { alignItems: "flex-end", minWidth: 70 },
  lineTotal: { fontWeight: "700", fontSize: 14, color: "#4f46e5" },
  removeText: { color: "#ef4444", fontSize: 11, marginTop: 4 },
  emptyWrap: { alignItems: "center", marginTop: 60 },
  emptyEmoji: { fontSize: 60, marginBottom: 10 },
  empty: { fontSize: 16, color: "#9ca3af" },
  footer: {
    padding: 15,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
  },
  summary: { marginBottom: 12 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  summaryLabel: { color: "#6b7280", fontSize: 14 },
  summaryValue: { color: "#1f2937", fontSize: 14, fontWeight: "600" },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: { fontWeight: "700", fontSize: 16, color: "#1f2937" },
  totalValue: { fontWeight: "700", fontSize: 18, color: "#4f46e5" },
  locationButton: {
    backgroundColor: "#f3f4f6",
    padding: 14,
    alignItems: "center",
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  locationButtonActive: {
    backgroundColor: "#ecfdf5",
    borderColor: "#10b981",
  },
  locationButtonText: { color: "#4b5563", fontWeight: "600", fontSize: 14 },
  locationButtonTextActive: { color: "#059669" },
  confirmButton: {
    backgroundColor: "#4f46e5",
    padding: 16,
    alignItems: "center",
    borderRadius: 12,
    minHeight: 52,
    justifyContent: "center",
  },
  confirmText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
