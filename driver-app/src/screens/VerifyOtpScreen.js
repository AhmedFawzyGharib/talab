import React, { useState, useContext, useEffect } from "react";
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
import { AuthContext } from "../context/AuthContext";

const RESEND_SECONDS = 30;

export default function VerifyOtpScreen({ route }) {
  const { phone, password } = route.params;
  const { clearApplicationPending } = useContext(AuthContext);

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const handleVerify = async () => {
    const clean = otp.trim();
    if (!/^\d{6}$/.test(clean)) {
      return Alert.alert("Invalid OTP", "OTP must be 6 digits");
    }

    setLoading(true);
    try {
      await publicApi.post("/auth/driver/set-password", {
        phone,
        otp: clean,
        password,
      });
      await clearApplicationPending();
    } catch (err) {
      Alert.alert(
        "Verification Failed",
        err.response?.data?.message || "Invalid OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || resending) return;
    setResending(true);
    try {
      await publicApi.post("/auth/driver/request-otp", { phone });
      setSecondsLeft(RESEND_SECONDS);
      Alert.alert("OTP sent", "A new code has been sent");
    } catch (err) {
      Alert.alert(
        "Resend Failed",
        err.response?.data?.message || "Could not resend"
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.emoji}>🔐</Text>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to{"\n"}
          <Text style={styles.phoneText}>{phone}</Text>
        </Text>

        <TextInput
          placeholder="------"
          placeholderTextColor="#bbb"
          value={otp}
          onChangeText={(v) => setOtp(v.replace(/\D/g, ""))}
          keyboardType="number-pad"
          maxLength={6}
          style={styles.otpInput}
          editable={!loading}
        />

        <TouchableOpacity
          onPress={handleVerify}
          disabled={loading}
          style={[styles.primaryButton, loading && { opacity: 0.7 }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Verify</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendRow}
          onPress={handleResend}
          disabled={secondsLeft > 0 || resending}
        >
          {resending ? (
            <ActivityIndicator color="#4f46e5" size="small" />
          ) : (
            <Text
              style={[
                styles.resendText,
                secondsLeft > 0 && styles.resendDisabled,
              ]}
            >
              {secondsLeft > 0 ? `Resend OTP in ${secondsLeft}s` : "Resend OTP"}
            </Text>
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
    marginBottom: 20,
    lineHeight: 20,
  },
  phoneText: { color: "#4f46e5", fontWeight: "600" },
  otpInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontSize: 22,
    textAlign: "center",
    letterSpacing: 8,
    color: "#1f2937",
  },
  primaryButton: {
    backgroundColor: "#4f46e5",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 8,
    minHeight: 52,
    justifyContent: "center",
  },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  resendRow: { alignItems: "center", paddingVertical: 12 },
  resendText: { color: "#4f46e5", fontSize: 14, fontWeight: "600" },
  resendDisabled: { color: "#999", fontWeight: "400" },
});
