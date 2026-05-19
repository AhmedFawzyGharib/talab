import React, { useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import socket from "../socket";
import { publicApi } from "../api/api";
import { AuthContext } from "../context/AuthContext";

export default function PendingScreen({ navigation }) {
  const { clearApplicationPending } = useContext(AuthContext);
  const intervalRef = useRef(null);
  const phoneRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const phone = await AsyncStorage.getItem("lastAppliedPhone");
      if (!phone) return;
      phoneRef.current = phone;

      socket.emit("registerDriver", phone);

      const handleSocketApproval = () => goToSetPassword();
      socket.on("driverApproved", handleSocketApproval);

      try {
        const res = await publicApi.get(`/driver/status?phone=${phone}`);
        if (res.data.status === "approved") goToSetPassword();
      } catch (err) {
        console.log("Initial check failed:", err.message);
      }

      intervalRef.current = setInterval(async () => {
        try {
          const res = await publicApi.get(`/driver/status?phone=${phone}`);
          if (res.data.status === "approved") goToSetPassword();
        } catch (err) {
          console.log("Polling error:", err.message);
        }
      }, 5000);
    };

    init();
    return () => {
      socket.off("driverApproved");
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const goToSetPassword = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    navigation.reset({
      index: 0,
      routes: [{ name: "SetPassword", params: { phone: phoneRef.current } }],
    });
  };

  const cancelApplication = () => {
    Alert.alert(
      "Cancel Application",
      "Are you sure you want to cancel and return to login?",
      [
        { text: "Stay", style: "cancel" },
        {
          text: "Cancel & Logout",
          style: "destructive",
          onPress: async () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            await AsyncStorage.removeItem("lastAppliedPhone");
            await clearApplicationPending();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.emoji}>⏳</Text>
        <Text style={styles.title}>Application Under Review</Text>
        <Text style={styles.subtitle}>
          Our team is reviewing your application. You'll be notified once
          approved.
        </Text>

        <View style={styles.loadingRow}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.checkingText}>Checking status...</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Keep this app open. We'll notify you as soon as the admin
            approves your application.
          </Text>
        </View>

        <TouchableOpacity style={styles.cancelButton} onPress={cancelApplication}>
          <Text style={styles.cancelText}>Cancel Application</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f4f8",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    alignItems: "center",
  },
  emoji: { fontSize: 60, marginBottom: 10 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  loadingRow: { alignItems: "center", marginBottom: 24 },
  checkingText: { color: "#6b7280", marginTop: 10, fontSize: 13 },
  infoBox: {
    backgroundColor: "#eef2ff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    width: "100%",
  },
  infoText: {
    color: "#4338ca",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  cancelButton: { paddingVertical: 10 },
  cancelText: { color: "#ef4444", fontSize: 13, fontWeight: "600" },
});
