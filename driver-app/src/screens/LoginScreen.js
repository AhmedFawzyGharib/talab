import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { AuthContext } from "../context/AuthContext";

const PHONE_REGEX = /^01[0125]\d{8}$/;

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!PHONE_REGEX.test(phone)) {
      return Alert.alert(
        "Invalid phone",
        "Phone must be 11 digits starting with 010/011/012/015"
      );
    }
    if (password.length < 6) {
      return Alert.alert("Invalid password", "Password must be at least 6 characters");
    }

    setLoading(true);
    const result = await login(phone, password);
    setLoading(false);

    if (!result?.success) {
      Alert.alert("Login Failed", result?.message || "Invalid credentials");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.emoji}>🚚</Text>
        <Text style={styles.title}>Driver Login</Text>
        <Text style={styles.subtitle}>Sign in to start delivering</Text>

        <TextInput
          placeholder="Phone (e.g. 01012345678)"
          placeholderTextColor="#999"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          maxLength={11}
          style={styles.input}
          editable={!loading}
        />

        <View style={styles.passwordRow}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
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

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("DriverApply")}
          disabled={loading}
        >
          <Text style={styles.secondaryButtonText}>
            New driver? Apply now
          </Text>
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
  emoji: { fontSize: 48, textAlign: "center", marginBottom: 6 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 25,
    marginTop: 4,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    color: "#333",
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 15,
  },
  passwordInput: { flex: 1, padding: 15, color: "#333" },
  eyeButton: { paddingHorizontal: 14, paddingVertical: 12 },
  eyeText: { fontSize: 18 },
  primaryButton: {
    backgroundColor: "#4f46e5",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
    minHeight: 52,
    justifyContent: "center",
  },
  buttonDisabled: { opacity: 0.7 },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#4f46e5",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: { color: "#4f46e5", fontSize: 15, fontWeight: "600" },
});
