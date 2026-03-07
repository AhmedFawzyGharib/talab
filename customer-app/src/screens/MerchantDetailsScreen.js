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
  const { merchantId, merchantName } = route.params;

  const { addToCart } = useContext(CartContext);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 جلب منتجات التاجر
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get(`/products/merchant/${merchantId}`);
      setProducts(response.data);
    } catch (error) {
      console.log("PRODUCT FETCH ERROR:", error.message);
      Alert.alert("Error", "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 إضافة منتج للسلة
  const handleAddToCart = (product) => {
    addToCart(product);
    Alert.alert("Added to Cart", `${product.name} added successfully`);
  };

  // 🔥 الذهاب للسلة
  const goToCart = () => {
    navigation.navigate("Cart", {
      merchantId: merchantId,
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.productCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price} SAR</Text>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddToCart(item)}
      >
        <Text style={styles.addText}>Add</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No products available</Text>
        }
      />

      {/* زر الذهاب للسلة */}
      <TouchableOpacity style={styles.cartButton} onPress={goToCart}>
        <Text style={styles.cartButtonText}>Go To Cart</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },

  productCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    marginBottom: 10,
  },

  productName: {
    fontSize: 16,
    fontWeight: "bold",
  },

  productPrice: {
    fontSize: 14,
    marginTop: 5,
    color: "#555",
  },

  addButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },

  addText: {
    color: "#fff",
    fontWeight: "bold",
  },

  cartButton: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  cartButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#777",
  },
});