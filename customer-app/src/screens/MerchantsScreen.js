import React, { useEffect, useState, useContext, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";

export default function MerchantsScreen({ navigation }) {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    loadMerchants();

    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={{ marginRight: 6 }}>
          <Text style={{ color: "#ef4444", fontWeight: "700" }}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, []);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  const loadMerchants = async () => {
    try {
      const res = await api.get("/merchants");
      setMerchants(res.data || []);
    } catch (error) {
      console.log("MERCHANT ERROR:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMerchants();
  };

  const filtered = useMemo(() => {
    if (!query.trim()) return merchants;
    const q = query.toLowerCase();
    return merchants.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.category?.toLowerCase().includes(q) ||
        m.type?.toLowerCase().includes(q)
    );
  }, [merchants, query]);

  const renderItem = ({ item }) => {
    const initial = (item.name || "?").charAt(0).toUpperCase();
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate("MerchantDetails", {
            merchantId: item._id,
            merchantName: item.name,
          })
        }
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.metaRow}>
            {item.category || item.type ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {item.category || item.type}
                </Text>
              </View>
            ) : null}
            {item.rating ? (
              <Text style={styles.rating}>⭐ {item.rating.toFixed(1)}</Text>
            ) : null}
          </View>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
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
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          placeholder="Search shops or category..."
          placeholderTextColor="#9ca3af"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15, paddingTop: 5 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4f46e5"]}
            tintColor="#4f46e5"
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            {query ? "No matches found" : "No shops available"}
          </Text>
        }
      />
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
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 15,
    marginBottom: 5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: "#1f2937", fontSize: 14 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: { fontSize: 22, fontWeight: "bold", color: "#4f46e5" },
  name: { fontSize: 16, fontWeight: "700", color: "#1f2937" },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  badge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 8,
  },
  badgeText: { color: "#4b5563", fontSize: 11, fontWeight: "600" },
  rating: { fontSize: 12, color: "#f59e0b", fontWeight: "600" },
  arrow: { fontSize: 24, color: "#9ca3af", fontWeight: "300" },
  empty: {
    textAlign: "center",
    marginTop: 50,
    color: "#9ca3af",
    fontSize: 15,
  },
});
