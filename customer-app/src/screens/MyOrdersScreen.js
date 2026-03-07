import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from "react-native";

import api from "../api/api";

export default function MyOrdersScreen({ navigation }) {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    loadOrders();

  }, []);

  const loadOrders = async () => {

    try {

      setLoading(true);

      const res = await api.get("/orders/my");

      const fetchedOrders =
        res.data?.data ?? res.data ?? [];

      setOrders(fetchedOrders);

    } catch (error) {

      console.log(
        "LOAD ORDERS ERROR:",
        error.response?.data ?? error.message
      );

    } finally {

      setLoading(false);

    }

  };

  /* ===============================
     STATUS COLOR
  ================================= */

  const getStatusColor = (status) => {

    switch (status) {

      case "pending":
        return "#f39c12";

      case "accepted":
        return "#3498db";

      case "on_the_way":
        return "#8e44ad";

      case "delivered":
        return "#2ecc71";

      case "cancelled":
        return "#e74c3c";

      default:
        return "#7f8c8d";

    }

  };

  /* ===============================
     ORDER TYPE BADGE
  ================================= */

  const renderTypeBadge = (type) => {

    if (type === "custom") {

      return (

        <View style={[styles.badge, styles.customBadge]}>

          <Text style={styles.badgeText}>
            📦 Custom Delivery
          </Text>

        </View>

      );

    }

    return (

      <View style={[styles.badge, styles.merchantBadge]}>

        <Text style={styles.badgeText}>
          🍔 Merchant Order
        </Text>

      </View>

    );

  };

  /* ===============================
     RENDER ITEM
  ================================= */

  const renderItem = ({ item }) => (

    <View style={styles.card}>

      {/* ORDER TYPE */}

      {renderTypeBadge(item.type)}

      {/* ORDER ID */}

      <Text style={styles.id}>
        Order ID: {item._id.slice(-6)}
      </Text>

      {/* STATUS */}

      <Text
        style={{
          color: getStatusColor(item.status),
          fontWeight: "bold"
        }}
      >

        Status:
        {" "}
        {item.status.charAt(0).toUpperCase() +
          item.status.slice(1)}

      </Text>

      {/* PRICE */}

      <Text>
        Total: {item.totalPrice} SAR
      </Text>

      {/* TRACK BUTTON */}

      {item.status !== "delivered" && (

        <TouchableOpacity
          style={styles.trackButton}
          onPress={() =>
            navigation.navigate("Tracking", {
              orderId: item._id
            })
          }
        >

          <Text style={styles.trackText}>
            Track Order
          </Text>

        </TouchableOpacity>

      )}

    </View>

  );

  /* ===============================
     LOADING
  ================================= */

  if (loading) {

    return (

      <View style={styles.loadingContainer}>

        <ActivityIndicator
          size="large"
          color="#3498db"
        />

        <Text style={{ marginTop: 10 }}>
          Loading orders...
        </Text>

      </View>

    );

  }

  /* ===============================
     EMPTY
  ================================= */

  if (orders.length === 0) {

    return (

      <View style={styles.loadingContainer}>
        <Text>No orders found.</Text>
      </View>

    );

  }

  /* ===============================
     LIST
  ================================= */

  return (

    <FlatList
      data={orders}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 15 }}
    />

  );

}

const styles = StyleSheet.create({

  card: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 }
  },

  id: {
    fontWeight: "bold",
    marginBottom: 5
  },

  trackButton: {
    marginTop: 10,
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 8
  },

  trackText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold"
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6
  },

  merchantBadge: {
    backgroundColor: "#3498db"
  },

  customBadge: {
    backgroundColor: "#9b59b6"
  },

  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold"
  }

});