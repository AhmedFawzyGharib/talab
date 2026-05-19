import React, { useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthContext } from "../context/AuthContext";

const FEATURES = [
  {
    key: "Merchants",
    icon: "🏪",
    title: "Browse Shops",
    subtitle: "Restaurants, markets & more",
    color: "#4f46e5",
  },
  {
    key: "CustomDelivery",
    icon: "📦",
    title: "Custom Delivery",
    subtitle: "Send anywhere, anything",
    color: "#7c3aed",
  },
  {
    key: "MyOrders",
    icon: "🧾",
    title: "My Orders",
    subtitle: "Track active & past orders",
    color: "#0ea5e9",
  },
  {
    key: "Profile",
    icon: "👤",
    title: "My Profile",
    subtitle: "Edit your info & password",
    color: "#10b981",
  },
];

export default function HomeScreen({ navigation }) {
  const { logout } = useContext(AuthContext);

  const confirmLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello 👋</Text>
            <Text style={styles.subGreeting}>What would you like today?</Text>
          </View>
          <TouchableOpacity style={styles.logoutIcon} onPress={confirmLogout}>
            <Text style={styles.logoutIconText}>⎋</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Fast delivery</Text>
          <Text style={styles.heroSubtitle}>
            Order from your favorite shops or send custom packages anywhere in the city.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Services</Text>

        {FEATURES.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={styles.featureCard}
            onPress={() => navigation.navigate(f.key)}
            activeOpacity={0.8}
          >
            <View
              style={[styles.iconWrap, { backgroundColor: `${f.color}15` }]}
            >
              <Text style={styles.iconText}>{f.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureSubtitle}>{f.subtitle}</Text>
            </View>
            <Text style={[styles.arrow, { color: f.color }]}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f4f8" },
  scroll: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: { fontSize: 28, fontWeight: "bold", color: "#1f2937" },
  subGreeting: { fontSize: 14, color: "#6b7280", marginTop: 2 },
  logoutIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  logoutIconText: { fontSize: 20, color: "#ef4444", fontWeight: "bold" },
  heroCard: {
    backgroundColor: "#4f46e5",
    borderRadius: 20,
    padding: 22,
    marginBottom: 25,
    elevation: 4,
    shadowColor: "#4f46e5",
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 6 },
  heroSubtitle: { color: "#e0e7ff", fontSize: 13, lineHeight: 20 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6b7280",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  featureCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  iconText: { fontSize: 26 },
  featureTitle: { fontSize: 16, fontWeight: "700", color: "#1f2937" },
  featureSubtitle: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  arrow: { fontSize: 28, fontWeight: "300" },
});
