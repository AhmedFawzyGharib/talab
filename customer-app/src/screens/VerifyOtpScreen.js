import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";

const RESEND_SECONDS = 30;

export default function VerifyOtpScreen({ route, navigation }) {
  const { name, phone, password } = route.params;
  const { setTokenDirectly } = useContext(AuthContext);

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
    const cleanOtp = otp.trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      return Alert.alert("Invalid OTP", "OTP must be 6 digits");
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/customer/verify-otp", {
        name,
        phone,
        password,
        otp: cleanOtp,
      });
      await setTokenDirectly(res.data.token);
    } catch (err) {
      console.log("VERIFY ERROR:", err.response?.data);
      Alert.alert(
        "Verification Failed",
        err.response?.data?.message || "Invalid or expired OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || resending) return;
    setResending(true);
    try {
      await api.post("/auth/customer/register", { name, phone, password });
      setSecondsLeft(RESEND_SECONDS);
      Alert.alert("OTP sent", "A new code has been sent to your phone");
    } catch (err) {
      Alert.alert(
        "Resend Failed",
        err.response?.data?.message || "Could not resend OTP"
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
        <Text style={styles.title}>Verify OTP 🔐</Text>
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
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading}
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
              {secondsLeft > 0
                ? `Resend OTP in ${secondsLeft}s`
                : "Resend OTP"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.backButtonText}>← Back</Text>
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
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 6,
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 20,
  },
  phoneText: {
    color: "#4f46e5",
    fontWeight: "600",
  },
  otpInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontSize: 22,
    textAlign: "center",
    letterSpacing: 8,
    color: "#333",
  },
  primaryButton: {
    backgroundColor: "#4f46e5",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
    minHeight: 52,
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  resendRow: {
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 8,
  },
  resendText: {
    color: "#4f46e5",
    fontSize: 14,
    fontWeight: "600",
  },
  resendDisabled: {
    color: "#999",
    fontWeight: "400",
  },
  backButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  backButtonText: {
    color: "#666",
    fontSize: 14,
  },
});
