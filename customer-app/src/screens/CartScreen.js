import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";

import { CartContext } from "../context/CartContext";
import api from "../api/api";

export default function CartScreen({ navigation, route }) {

  const {
    cartItems,
    clearCart,
    deliveryLocation,
    setDeliveryLocation
  } = useContext(CartContext);

  const merchantId = route?.params?.merchantId;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const deliveryFee = 10;
  const total = subtotal + deliveryFee;

  /* ===============================
     Confirm Order
  ================================= */

  const handleConfirmOrder = async () => {

    if (!cartItems.length) {
      return Alert.alert("Cart is empty");
    }

    if (!deliveryLocation) {
      return Alert.alert("Please select delivery location");
    }

    if (!merchantId) {
      return Alert.alert("Merchant missing");
    }

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

      Alert.alert("Error creating order");

    }

  };

  /* ===============================
     Render Cart Item
  ================================= */

  const renderItem = ({ item }) => (

    <View style={styles.item}>

      <Text style={styles.name}>
        {item.name}
      </Text>

      <Text>
        Qty: {item.quantity}
      </Text>

      <Text>
        {item.price * item.quantity} SAR
      </Text>

    </View>

  );

  return (

    <View style={styles.container}>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Cart is empty
          </Text>
        }
      />

      {/* Summary */}

      <View style={styles.summary}>

        <Text>
          Subtotal: {subtotal} SAR
        </Text>

        <Text>
          Delivery: {deliveryFee} SAR
        </Text>

        <Text style={styles.total}>
          Total: {total} SAR
        </Text>

        {deliveryLocation ? (

          <Text style={styles.location}>
            Location Selected ✔
          </Text>

        ) : (

          <Text style={styles.locationMissing}>
            No Location Selected
          </Text>

        )}

      </View>

      {/* Select Location */}

      <TouchableOpacity
        style={styles.locationButton}
        onPress={() =>
          navigation.navigate("SelectLocation", {

            onSelect: (location) => {

              setDeliveryLocation(location);

            },

          })
        }
      >
        <Text style={styles.buttonText}>
          Select Delivery Location
        </Text>
      </TouchableOpacity>

      {/* Confirm */}

      <TouchableOpacity
        style={styles.confirmButton}
        onPress={handleConfirmOrder}
      >
        <Text style={styles.buttonText}>
          Confirm Order
        </Text>
      </TouchableOpacity>

    </View>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 15,
  },

  item: {
    padding: 15,
    backgroundColor: "#f9f9f9",
    marginBottom: 10,
    borderRadius: 8,
  },

  name: {
    fontWeight: "bold",
    fontSize: 16,
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 18,
  },

  summary: {
    marginTop: 10,
    padding: 15,
    backgroundColor: "#ecf0f1",
    borderRadius: 8,
  },

  total: {
    fontWeight: "bold",
    fontSize: 18,
    marginTop: 5,
  },

  location: {
    marginTop: 10,
    color: "green",
    fontWeight: "bold",
  },

  locationMissing: {
    marginTop: 10,
    color: "red",
    fontWeight: "bold",
  },

  locationButton: {
    backgroundColor: "#3498db",
    padding: 15,
    alignItems: "center",
    marginTop: 15,
    borderRadius: 8,
  },

  confirmButton: {
    backgroundColor: "#e67e22",
    padding: 18,
    alignItems: "center",
    marginTop: 10,
    borderRadius: 8,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

});