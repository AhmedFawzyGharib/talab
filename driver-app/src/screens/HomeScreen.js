import React, { useEffect, useState, useRef, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from "react-native";

import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

import api from "../api/api";
import socket from "../socket";
import { AuthContext } from "../context/AuthContext";

export default function HomeScreen() {

  const { logout } = useContext(AuthContext);

  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [distance, setDistance] = useState(null);

  const trackingInterval = useRef(null);
  const refreshInterval = useRef(null);

  /* ===============================
     Logout
  ================================= */

  const handleLogout = () => {

    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            stopTracking();
            clearInterval(refreshInterval.current);
            socket.disconnect();
            await logout();
          },
        },
      ]
    );

  };

  /* ===============================
     Calculate Distance
  ================================= */

  const calculateDistance = (lat1, lon1, lat2, lon2) => {

    const R = 6371;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
      Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;

  };

  /* ===============================
     Fetch Orders
  ================================= */

  const fetchOrders = async () => {

    try {

      const res = await api.get("/orders/available");

      setOrders(res.data);

    } catch (err) {

      console.log("LOAD ORDERS ERROR:", err.response?.data);

    }

  };

  /* ===============================
     Check Active Order
  ================================= */

  const checkActiveOrder = async () => {

    try {

      const res = await api.get("/orders/driver/active");

      if (res.data) {

        setActiveOrder(res.data);

        socket.emit("joinOrderRoom", res.data._id);

        startLiveTracking(res.data._id);

      } else {

        fetchOrders();

      }

    } catch (err) {

      console.log("ACTIVE ORDER ERROR:", err.response?.data);

    }

  };

  useEffect(() => {

    checkActiveOrder();

    refreshInterval.current = setInterval(() => {

      if (!activeOrder) fetchOrders();

    }, 8000);

    return () => {

      stopTracking();
      clearInterval(refreshInterval.current);

    };

  }, []);

  /* ===============================
     Live Tracking
  ================================= */

  const startLiveTracking = async (orderId) => {

    if (trackingInterval.current) return;

    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {

      Alert.alert("Location permission denied");

      return;

    }

    trackingInterval.current = setInterval(async () => {

      try {

        const location =
          await Location.getCurrentPositionAsync({});

        const { latitude, longitude } =
          location.coords;

        if (activeOrder?.deliveryLocation?.coordinates) {

          const lat =
            activeOrder.deliveryLocation.coordinates[1];

          const lng =
            activeOrder.deliveryLocation.coordinates[0];

          const dist = calculateDistance(
            latitude,
            longitude,
            lat,
            lng
          );

          setDistance(dist.toFixed(2));

        }

        socket.emit("driverLocationUpdate", {
          orderId,
          lat: latitude,
          lng: longitude,
        });

      } catch (err) {

        console.log("LOCATION ERROR:", err);

      }

    }, 5000);

  };

  const stopTracking = () => {

    if (trackingInterval.current) {

      clearInterval(trackingInterval.current);

      trackingInterval.current = null;

    }

  };

  /* ===============================
     Accept Order
  ================================= */

  const handleAccept = async (order) => {

    try {

      const res = await api.put(`/orders/${order._id}/accept`);

      setActiveOrder(res.data.order);

      setOrders([]);

      socket.emit("joinOrderRoom", order._id);

      startLiveTracking(order._id);

    } catch {

      Alert.alert("Order already taken");

    }

  };

  /* ===============================
     Update Status
  ================================= */

  const updateStatus = async (status) => {

    try {

      const res = await api.put(
        `/orders/${activeOrder._id}/status`,
        { status }
      );

      setActiveOrder(res.data.order);

      if (status === "delivered") {

        stopTracking();

        setTimeout(() => {

          setActiveOrder(null);

          fetchOrders();

        }, 3000);

      }

    } catch (err) {

      console.log("STATUS ERROR:", err.response?.data);

    }

  };

  /* ===============================
     Active Order Screen
  ================================= */

  if (activeOrder?.deliveryLocation?.coordinates) {

    const lat =
      activeOrder.deliveryLocation.coordinates[1];

    const lng =
      activeOrder.deliveryLocation.coordinates[0];

    return (

      <View style={{ flex: 1 }}>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >

          <Marker
            coordinate={{ latitude: lat, longitude: lng }}
            title="Customer"
            pinColor="green"
          />

        </MapView>

        <View style={styles.panel}>

          <Text style={styles.title}>Active Order</Text>

          <Text>Status: {activeOrder.status}</Text>

          <Text>Total: {activeOrder.totalPrice || 0} SAR</Text>

          <Text>
            Type: {activeOrder.type === "custom"
              ? "Custom Delivery"
              : "Merchant Order"}
          </Text>

          {distance && (
            <Text>Distance: {distance} km</Text>
          )}

          {/* Merchant Order Items */}

          {activeOrder.items?.length > 0 && (

            <View style={styles.itemsBox}>

              <Text style={styles.itemsTitle}>
                Order Items
              </Text>

              {activeOrder.items.map((item, index) => (

                <Text key={index}>
                  {item.name} x{item.quantity}
                </Text>

              ))}

            </View>

          )}

          {/* Custom Delivery */}

          {activeOrder.type === "custom" && (

            <View style={styles.itemsBox}>

              <Text style={styles.itemsTitle}>
                Custom Delivery
              </Text>

              {activeOrder.pickupName && (
                <Text>
                  Pickup: {activeOrder.pickupName}
                </Text>
              )}

              {activeOrder.note && (
                <Text>
                  Items: {activeOrder.note}
                </Text>
              )}

            </View>

          )}

          <TouchableOpacity
            style={styles.navigateButton}
            onPress={() =>
              Linking.openURL(
                `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
              )
            }
          >
            <Text style={styles.buttonText}>
              Navigate
            </Text>
          </TouchableOpacity>

          {activeOrder.status === "accepted" && (
            <Button
              text="Picked"
              onPress={() => updateStatus("picked")}
            />
          )}

          {activeOrder.status === "picked" && (
            <Button
              text="On The Way"
              onPress={() => updateStatus("on_the_way")}
            />
          )}

          {activeOrder.status === "on_the_way" && (
            <Button
              text="Delivered"
              onPress={() => updateStatus("delivered")}
            />
          )}

        </View>

      </View>

    );

  }

  /* ===============================
     Available Orders
  ================================= */

  return (

    <View style={styles.container}>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (

          <View style={styles.card}>

            <Text>
              Order #{item._id.slice(-5)}
            </Text>

            <Text>
              Type: {item.type === "custom"
                ? "Custom Delivery"
                : "Merchant"}
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => handleAccept(item)}
            >
              <Text style={styles.buttonText}>
                Accept Order
              </Text>
            </TouchableOpacity>

          </View>

        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No available orders
          </Text>
        }
      />

    </View>

  );

}

const Button = ({ text, onPress }) => (
  <TouchableOpacity
    style={styles.button}
    onPress={onPress}
  >
    <Text style={styles.buttonText}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
  },

  logoutButton: {
    backgroundColor: "#e74c3c",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },

  logoutText: {
    color: "#fff",
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#f1f1f1",
    padding: 15,
    marginBottom: 12,
    borderRadius: 10,
  },

  panel: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  button: {
    backgroundColor: "#27ae60",
    padding: 12,
    marginTop: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  navigateButton: {
    backgroundColor: "#8e44ad",
    padding: 12,
    marginTop: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "gray",
  },

  itemsBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#eee",
    borderRadius: 8,
  },

  itemsTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },

});