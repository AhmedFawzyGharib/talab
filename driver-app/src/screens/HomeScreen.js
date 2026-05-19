import React, { useEffect, useState, useRef, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";

import api from "../api/api";
import socket from "../socket";
import { AuthContext } from "../context/AuthContext";

const STATUS_META = {
  accepted: { label: "Accepted", color: "#3b82f6", next: "picked", nextLabel: "Mark Picked Up" },
  picked: { label: "Picked", color: "#8b5cf6", next: "on_the_way", nextLabel: "Start Delivery" },
  on_the_way: { label: "On the way", color: "#f59e0b", next: "delivered", nextLabel: "Mark Delivered" },
  delivered: { label: "Delivered", color: "#10b981", next: null },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen({ navigation }) {
  const { logout, user } = useContext(AuthContext);
  const driverName = user?.name || "Driver";
  const firstName = driverName.split(" ")[0];
  const API_HOST = "http://10.0.0.99:5000";
  const avatarUrl = user?.avatar ? `${API_HOST}/uploads/${user.avatar}` : null;

  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const trackingInterval = useRef(null);
  const refreshInterval = useRef(null);

  /* ===============================
     LOGOUT
  ================================= */
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
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
    ]);
  };

  /* ===============================
     FETCH ORDERS
  ================================= */
  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders/available");
      setOrders(res.data || []);
    } catch (err) {
      console.log("LOAD ORDERS ERROR:", err.response?.data);
    } finally {
      setRefreshing(false);
    }
  };

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
    } finally {
      setLoading(false);
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
     LIVE TRACKING
  ================================= */
  const startLiveTracking = async (orderId) => {
    if (trackingInterval.current) return;
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Location permission denied");
      return;
    }
    trackingInterval.current = setInterval(async () => {
      try {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
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
     ACCEPT ORDER
  ================================= */
  const handleAccept = async (order) => {
    try {
      const res = await api.put(`/orders/${order._id}/accept`);
      setActiveOrder(res.data.order);
      setSelectedOrder(null);
      setOrders([]);
      socket.emit("joinOrderRoom", order._id);
      startLiveTracking(order._id);
    } catch {
      Alert.alert("Already taken", "This order was just accepted by another driver");
    }
  };

  /* ===============================
     UPDATE STATUS
  ================================= */
  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      const res = await api.put(`/orders/${activeOrder._id}/status`, { status });
      setActiveOrder(res.data.order);
      if (status === "delivered") {
        stopTracking();
        setTimeout(() => {
          setActiveOrder(null);
          fetchOrders();
        }, 3000);
      }
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Could not update");
    } finally {
      setUpdating(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (activeOrder) checkActiveOrder();
    else fetchOrders();
  };

  /* ===============================
     ORDER DETAILS (before accept)
  ================================= */
  if (selectedOrder) {
    const pickup = selectedOrder.pickups?.[0]?.location?.coordinates;
    const delivery = selectedOrder.deliveryLocation?.coordinates;
    const pickupLat = pickup ? pickup[1] : null;
    const pickupLng = pickup ? pickup[0] : null;
    const deliveryLat = delivery ? delivery[1] : null;
    const deliveryLng = delivery ? delivery[0] : null;

    return (
      <View style={{ flex: 1, backgroundColor: "#f2f4f8" }}>
        {pickupLat && deliveryLat && (
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: pickupLat,
              longitude: pickupLng,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            <Marker
              coordinate={{ latitude: pickupLat, longitude: pickupLng }}
              title="Pickup"
              pinColor="green"
            />
            <Marker
              coordinate={{ latitude: deliveryLat, longitude: deliveryLng }}
              title="Delivery"
              pinColor="red"
            />
            <Polyline
              coordinates={[
                { latitude: pickupLat, longitude: pickupLng },
                { latitude: deliveryLat, longitude: deliveryLng },
              ]}
              strokeWidth={4}
              strokeColor="#4f46e5"
            />
          </MapView>
        )}

        <View style={styles.bottomPanel}>
          <View style={styles.dragHandle} />
          <Text style={styles.panelTitle}>Order Details</Text>

          {selectedOrder.pickups?.length > 0 && (
            <View style={styles.locationRow}>
              <View style={[styles.dot, { backgroundColor: "#10b981" }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.locationLabel}>Pickup</Text>
                <Text style={styles.locationText}>
                  {selectedOrder.pickups[0].name}
                </Text>
                {selectedOrder.pickups[0].note && (
                  <Text style={styles.locationNote}>
                    {selectedOrder.pickups[0].note}
                  </Text>
                )}
              </View>
            </View>
          )}

          <View style={styles.locationRow}>
            <View style={[styles.dot, { backgroundColor: "#ef4444" }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.locationLabel}>Delivery</Text>
              <Text style={styles.locationText}>
                {selectedOrder.deliveryAddress || "Customer Location"}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            {selectedOrder.distance && (
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Distance</Text>
                <Text style={styles.statValue}>{selectedOrder.distance} km</Text>
              </View>
            )}
            {selectedOrder.totalPrice !== undefined && (
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Earning</Text>
                <Text style={[styles.statValue, { color: "#10b981" }]}>
                  {selectedOrder.totalPrice} SAR
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => handleAccept(selectedOrder)}
          >
            <Text style={styles.primaryButtonText}>✓ Accept Order</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setSelectedOrder(null)}
          >
            <Text style={styles.secondaryButtonText}>Back to list</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ===============================
     ACTIVE ORDER
  ================================= */
  if (activeOrder?.deliveryLocation?.coordinates) {
    const lat = activeOrder.deliveryLocation.coordinates[1];
    const lng = activeOrder.deliveryLocation.coordinates[0];
    const meta = STATUS_META[activeOrder.status] || {
      label: activeOrder.status,
      color: "#6b7280",
    };

    return (
      <View style={{ flex: 1 }}>
        <SafeAreaView edges={["top"]} style={styles.activeHeader}>
          <View>
            <Text style={styles.activeHeaderTitle}>Active Delivery</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: meta.color + "22" },
              ]}
            >
              <Text style={[styles.statusBadgeText, { color: meta.color }]}>
                ● {meta.label}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutIconBtn}
          >
            <Text style={{ fontSize: 18 }}>⎋</Text>
          </TouchableOpacity>
        </SafeAreaView>

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
            pinColor="#4f46e5"
          />
        </MapView>

        <View style={styles.bottomPanel}>
          <View style={styles.dragHandle} />

          <View style={styles.activeOrderRow}>
            <View>
              <Text style={styles.orderId}>
                #{activeOrder._id.slice(-6).toUpperCase()}
              </Text>
              <Text style={styles.earning}>
                {activeOrder.totalPrice || 0} SAR
              </Text>
            </View>
            <TouchableOpacity
              style={styles.navigateButton}
              onPress={() =>
                Linking.openURL(
                  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
                )
              }
            >
              <Text style={styles.navigateText}>🧭 Navigate</Text>
            </TouchableOpacity>
          </View>

          {meta.next && (
            <TouchableOpacity
              style={[styles.primaryButton, updating && { opacity: 0.7 }]}
              onPress={() => updateStatus(meta.next)}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>{meta.nextLabel}</Text>
              )}
            </TouchableOpacity>
          )}

          {!meta.next && (
            <View style={styles.completedBox}>
              <Text style={styles.completedText}>🎉 Delivery completed!</Text>
              <Text style={styles.completedSub}>
                Loading next available orders...
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  /* ===============================
     AVAILABLE ORDERS LIST
  ================================= */
  if (loading) {
    return (
      <View style={styles.centerLoader}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.welcomeBar}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Profile")}
          activeOpacity={0.7}
        >
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {firstName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.greeting}>{getGreeting()} 👋</Text>
          <Text style={styles.welcomeName}>{firstName}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("Profile")}
          style={styles.logoutIconBtnLight}
        >
          <Text style={{ fontSize: 18, color: "#fff" }}>👤</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.logoutIconBtnLight, { marginLeft: 8 }]}
        >
          <Text style={{ fontSize: 18, color: "#fff" }}>⎋</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.headerTitle}>Available Orders</Text>
        <Text style={styles.headerSub}>
          {orders.length} {orders.length === 1 ? "order" : "orders"} ready
        </Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 15, paddingTop: 5 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4f46e5"]}
            tintColor="#4f46e5"
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.orderCard}
            onPress={() => setSelectedOrder(item)}
            activeOpacity={0.85}
          >
            <View style={styles.orderCardHeader}>
              <Text style={styles.orderId}>
                #{item._id.slice(-6).toUpperCase()}
              </Text>
              <View
                style={[
                  styles.typeBadge,
                  {
                    backgroundColor:
                      item.type === "custom" ? "#ede9fe" : "#e0e7ff",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.typeBadgeText,
                    {
                      color: item.type === "custom" ? "#7c3aed" : "#4f46e5",
                    },
                  ]}
                >
                  {item.type === "custom" ? "📦 Custom" : "🏬 Merchant"}
                </Text>
              </View>
            </View>

            {item.deliveryAddress && (
              <Text style={styles.address} numberOfLines={1}>
                📍 {item.deliveryAddress}
              </Text>
            )}

            <View style={styles.orderCardFooter}>
              {item.distance && (
                <Text style={styles.metaText}>📏 {item.distance} km</Text>
              )}
              {item.totalPrice !== undefined && (
                <Text style={styles.earning}>{item.totalPrice} SAR</Text>
              )}
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.detailsBtn}
                onPress={() => setSelectedOrder(item)}
              >
                <Text style={styles.detailsBtnText}>Details</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={() => handleAccept(item)}
              >
                <Text style={styles.acceptBtnText}>✓ Accept</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>No orders right now</Text>
            <Text style={styles.emptySub}>
              Pull down to refresh, or wait for new orders
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f4f8" },
  centerLoader: {
    flex: 1,
    backgroundColor: "#f2f4f8",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  welcomeBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#4f46e5",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
  },
  avatarText: { color: "#4f46e5", fontSize: 22, fontWeight: "bold" },
  greeting: { color: "#e0e7ff", fontSize: 13, fontWeight: "500" },
  welcomeName: { color: "#fff", fontSize: 20, fontWeight: "bold", marginTop: 2 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#1f2937" },
  headerSub: { fontSize: 12, color: "#6b7280" },
  logoutIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutIconBtnLight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  activeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  activeHeaderTitle: { fontSize: 14, color: "#6b7280", fontWeight: "600" },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  statusBadgeText: { fontSize: 12, fontWeight: "700" },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  orderCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderId: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6b7280",
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: { fontSize: 11, fontWeight: "700" },
  address: { fontSize: 13, color: "#4b5563", marginBottom: 8 },
  orderCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  metaText: { fontSize: 12, color: "#6b7280" },
  earning: { fontSize: 18, fontWeight: "bold", color: "#10b981" },
  cardActions: { flexDirection: "row", gap: 8 },
  detailsBtn: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
  },
  detailsBtnText: { color: "#374151", fontWeight: "600", fontSize: 13 },
  acceptBtn: {
    flex: 1,
    backgroundColor: "#4f46e5",
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
  },
  acceptBtnText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  bottomPanel: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
  },
  dragHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e5e7eb",
    marginBottom: 14,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 14,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
    marginTop: 6,
  },
  locationLabel: {
    fontSize: 11,
    color: "#9ca3af",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  locationText: { fontSize: 14, color: "#1f2937", marginTop: 2 },
  locationNote: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  statValue: { fontSize: 16, fontWeight: "bold", color: "#1f2937", marginTop: 4 },
  activeOrderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  navigateButton: {
    backgroundColor: "#eef2ff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  navigateText: { color: "#4f46e5", fontWeight: "bold", fontSize: 13 },
  primaryButton: {
    backgroundColor: "#4f46e5",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
    minHeight: 52,
    justifyContent: "center",
  },
  primaryButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  secondaryButton: {
    paddingVertical: 12,
    marginTop: 8,
    alignItems: "center",
  },
  secondaryButtonText: { color: "#6b7280", fontSize: 14, fontWeight: "600" },
  completedBox: {
    backgroundColor: "#d1fae5",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
  },
  completedText: { fontSize: 18, fontWeight: "bold", color: "#065f46" },
  completedSub: { color: "#047857", fontSize: 13, marginTop: 4 },
  emptyWrap: { alignItems: "center", marginTop: 60 },
  emptyEmoji: { fontSize: 60, marginBottom: 10 },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#1f2937" },
  emptySub: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 6,
    textAlign: "center",
  },
});
