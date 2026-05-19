import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import api from "../api/api";

const STATUS_META = {
  pending: { color: "#f59e0b", bg: "#fef3c7", label: "Pending", icon: "⏳" },
  accepted: { color: "#3b82f6", bg: "#dbeafe", label: "Accepted", icon: "✓" },
  on_the_way: { color: "#8b5cf6", bg: "#ede9fe", label: "On the way", icon: "🚗" },
  delivered: { color: "#10b981", bg: "#d1fae5", label: "Delivered", icon: "✔" },
  cancelled: { color: "#ef4444", bg: "#fee2e2", label: "Cancelled", icon: "✕" },
};

export default function MyOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await api.get("/orders/my");
      const fetched = res.data?.data ?? res.data ?? [];
      setOrders(fetched);
    } catch (error) {
      console.log("LOAD ORDERS ERROR:", error.response?.data ?? error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders();
  }, []);

  const renderItem = ({ item }) => {
    const meta = STATUS_META[item.status] || {
      color: "#6b7280",
      bg: "#f3f4f6",
      label: item.status,
      icon: "•",
    };
    const isCustom = item.type === "custom";

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: isCustom ? "#ede9fe" : "#e0e7ff" },
            ]}
          >
            <Text
              style={[
                styles.typeBadgeText,
                { color: isCustom ? "#7c3aed" : "#4f46e5" },
              ]}
            >
              {isCustom ? "📦 Custom" : "🍔 Merchant"}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
            <Text style={[styles.statusText, { color: meta.color }]}>
              {meta.icon} {meta.label}
            </Text>
          </View>
        </View>

        <Text style={styles.id}>Order #{item._id.slice(-6).toUpperCase()}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Total</Text>
          <Text style={styles.priceValue}>{item.totalPrice} SAR</Text>
        </View>

        {item.status !== "delivered" && item.status !== "cancelled" && (
          <TouchableOpacity
            style={styles.trackButton}
            onPress={() =>
              navigation.navigate("Tracking", { orderId: item._id })
            }
            activeOpacity={0.85}
          >
            <Text style={styles.trackText}>Track Order →</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyEmoji}>📭</Text>
        <Text style={styles.emptyTitle}>No orders yet</Text>
        <Text style={styles.emptySubtitle}>
          Your orders will appear here once you place them
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      style={{ backgroundColor: "#f2f4f8" }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#4f46e5"]}
          tintColor="#4f46e5"
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 15 },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: { fontSize: 11, fontWeight: "700" },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 11, fontWeight: "700" },
  id: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  priceLabel: { color: "#6b7280", fontSize: 13 },
  priceValue: { color: "#1f2937", fontSize: 17, fontWeight: "700" },
  trackButton: {
    marginTop: 12,
    backgroundColor: "#4f46e5",
    paddingVertical: 12,
    borderRadius: 10,
  },
  trackText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 14,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f4f8",
    padding: 30,
  },
  loadingText: { marginTop: 12, color: "#6b7280" },
  emptyEmoji: { fontSize: 70, marginBottom: 15 },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: "#1f2937" },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
    textAlign: "center",
  },
});
