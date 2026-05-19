import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import api from "../api/api";
import { CartContext } from "../context/CartContext";

export default function MerchantDetailsScreen({ route, navigation }) {
  const { merchantId } = route.params;
  const { addToCart, cartItems } = useContext(CartContext);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get(`/products/merchant/${merchantId}`);
      setProducts(response.data || []);
    } catch (error) {
      console.log("PRODUCT FETCH ERROR:", error.message);
      Alert.alert("Error", "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  const renderItem = ({ item }) => {
    const inCart = cartItems.find((c) => c._id === item._id);
    return (
      <View style={styles.productCard}>
        <View style={styles.productImage}>
          <Text style={styles.productImageText}>
            {(item.name || "?").charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.description ? (
            <Text style={styles.productDesc} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
          <Text style={styles.productPrice}>{item.price} SAR</Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, inCart && styles.addButtonActive]}
          onPress={() => handleAddToCart(item)}
          activeOpacity={0.8}
        >
          <Text style={styles.addText}>
            {inCart ? `+ ${inCart.quantity}` : "+ Add"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No products available</Text>
        }
      />

      {totalItems > 0 && (
        <TouchableOpacity
          style={styles.floatingCart}
          onPress={() => navigation.navigate("Cart", { merchantId })}
          activeOpacity={0.9}
        >
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{totalItems}</Text>
          </View>
          <Text style={styles.cartLabel}>View Cart</Text>
          <Text style={styles.cartTotal}>{totalPrice} SAR</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f4f8" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f4f8",
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#fff",
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  productImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  productImageText: { fontSize: 22, fontWeight: "bold", color: "#4f46e5" },
  productName: { fontSize: 15, fontWeight: "700", color: "#1f2937" },
  productDesc: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  productPrice: {
    fontSize: 14,
    color: "#4f46e5",
    fontWeight: "700",
    marginTop: 4,
  },
  addButton: {
    backgroundColor: "#4f46e5",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginLeft: 8,
  },
  addButtonActive: { backgroundColor: "#7c3aed" },
  addText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    color: "#9ca3af",
    fontSize: 15,
  },
  floatingCart: {
    position: "absolute",
    bottom: 20,
    left: 15,
    right: 15,
    backgroundColor: "#4f46e5",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    elevation: 8,
    shadowColor: "#4f46e5",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  cartBadge: {
    backgroundColor: "#fff",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cartBadgeText: { color: "#4f46e5", fontWeight: "bold", fontSize: 14 },
  cartLabel: { color: "#fff", fontWeight: "bold", fontSize: 16, flex: 1 },
  cartTotal: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
