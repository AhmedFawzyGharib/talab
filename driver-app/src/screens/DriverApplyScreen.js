import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { publicApi } from "../api/api";
import { AuthContext } from "../context/AuthContext";

const PHONE_REGEX = /^01[0125]\d{8}$/;
const VEHICLE_OPTIONS = [
  { value: "car", label: "🚗 Car" },
  { value: "motorcycle", label: "🏍 Motorcycle" },
  { value: "bike", label: "🚲 Bike" },
];

export default function DriverApplyScreen({ navigation }) {
  const { markApplicationPending } = useContext(AuthContext);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    nationalId: "",
    licenseNumber: "",
    vehicleType: "car",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const submit = async () => {
    if (form.fullName.trim().length < 2) {
      return Alert.alert("Invalid name", "Full name is required");
    }
    if (!PHONE_REGEX.test(form.phone)) {
      return Alert.alert(
        "Invalid phone",
        "Phone must be 11 digits starting with 010/011/012/015"
      );
    }
    if (form.nationalId.trim().length < 5) {
      return Alert.alert("Invalid ID", "Please enter a valid National ID");
    }
    if (form.licenseNumber.trim().length < 3) {
      return Alert.alert("Invalid license", "Please enter a valid License Number");
    }

    setLoading(true);
    try {
      await publicApi.post("/driver/apply", form);
      await AsyncStorage.setItem("lastAppliedPhone", form.phone);
      await markApplicationPending(true);
    } catch (err) {
      Alert.alert(
        "Application failed",
        err.response?.data?.message || "Please try again"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backRow}
        >
          <Text style={styles.backText}>← Back to Login</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.title}>Driver Application 🚚</Text>
          <Text style={styles.subtitle}>
            Fill in your details to apply as a driver
          </Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            placeholder="John Doe"
            placeholderTextColor="#9ca3af"
            value={form.fullName}
            onChangeText={(v) => handleChange("fullName", v)}
            style={styles.input}
            editable={!loading}
          />

          <Text style={styles.label}>Email (optional)</Text>
          <TextInput
            placeholder="you@example.com"
            placeholderTextColor="#9ca3af"
            value={form.email}
            onChangeText={(v) => handleChange("email", v)}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            editable={!loading}
          />

          <Text style={styles.label}>Phone</Text>
          <TextInput
            placeholder="01012345678"
            placeholderTextColor="#9ca3af"
            value={form.phone}
            onChangeText={(v) => handleChange("phone", v)}
            keyboardType="phone-pad"
            maxLength={11}
            style={styles.input}
            editable={!loading}
          />

          <Text style={styles.label}>National ID</Text>
          <TextInput
            placeholder="National ID number"
            placeholderTextColor="#9ca3af"
            value={form.nationalId}
            onChangeText={(v) => handleChange("nationalId", v)}
            keyboardType="numeric"
            style={styles.input}
            editable={!loading}
          />

          <Text style={styles.label}>License Number</Text>
          <TextInput
            placeholder="Driving license number"
            placeholderTextColor="#9ca3af"
            value={form.licenseNumber}
            onChangeText={(v) => handleChange("licenseNumber", v)}
            style={styles.input}
            editable={!loading}
          />

          <Text style={styles.label}>Vehicle Type</Text>
          <View style={styles.vehicleRow}>
            {VEHICLE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.vehicleChip,
                  form.vehicleType === opt.value && styles.vehicleChipActive,
                ]}
                onPress={() => handleChange("vehicleType", opt.value)}
              >
                <Text
                  style={[
                    styles.vehicleChipText,
                    form.vehicleType === opt.value &&
                      styles.vehicleChipTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loading && { opacity: 0.7 }]}
            onPress={submit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Submit Application</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f4f8" },
  backRow: { marginBottom: 12 },
  backText: { color: "#4f46e5", fontWeight: "600" },
  card: {
    backgroundColor: "#fff",
    padding: 22,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  subtitle: { color: "#6b7280", fontSize: 14, marginBottom: 20 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    color: "#1f2937",
  },
  vehicleRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  vehicleChip: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  vehicleChipActive: {
    backgroundColor: "#eef2ff",
    borderColor: "#4f46e5",
  },
  vehicleChipText: { fontSize: 13, color: "#6b7280", fontWeight: "600" },
  vehicleChipTextActive: { color: "#4f46e5" },
  primaryButton: {
    backgroundColor: "#4f46e5",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    minHeight: 52,
    justifyContent: "center",
  },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
