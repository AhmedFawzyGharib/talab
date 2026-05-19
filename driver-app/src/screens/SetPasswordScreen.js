import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { publicApi } from "../api/api";

export default function SetPasswordScreen({ route, navigation }) {
  const { phone } = route.params;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      return Alert.alert("Error", "All fields are required");
    }
    if (password.length < 6) {
      return Alert.alert("Weak password", "Password must be at least 6 characters");
    }
    if (password !== confirmPassword) {
      return Alert.alert("Mismatch", "Passwords do not match");
    }

    setLoading(true);
    try {
      await publicApi.post("/auth/driver/request-otp", { phone });
      navigation.navigate("VerifyOtp", { phone, password });
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to send OTP"
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
      <View style={styles.card}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>You're Approved!</Text>
        <Text style={styles.subtitle}>
          Create a password to access your account
        </Text>

        <View style={styles.passwordRow}>
          <TextInput
            placeholder="New Password (min 6 characters)"
            placeholderTextColor="#9ca3af"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            style={styles.passwordInput}
            editable={!loading}
          />
          <TouchableOpacity
            onPress={() => setShowPassword((s) => !s)}
            style={styles.eyeButton}
          >
            <Text style={styles.eyeText}>{showPassword ? "🙈" : "👁"}</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor="#9ca3af"
          secureTextEntry={!showPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
          editable={!loading}
        />

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={[styles.primaryButton, loading && { opacity: 0.7 }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Send OTP</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    padding: 25,
    borderRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  emoji: { fontSize: 48, textAlign: "center", marginBottom: 8 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 24,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 14,
  },
  passwordInput: { flex: 1, padding: 14, color: "#1f2937" },
  eyeButton: { paddingHorizontal: 14, paddingVertical: 12 },
  eyeText: { fontSize: 18 },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    color: "#1f2937",
  },
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
