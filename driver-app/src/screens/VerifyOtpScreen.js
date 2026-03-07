import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { publicApi } from "../api/api";
import { AuthContext } from "../context/AuthContext";

export default function VerifyOtpScreen({ route }) {
  const { phone, password } = route.params;

  const { clearApplicationPending } = useContext(AuthContext);

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp) {
      return Alert.alert("Error", "Enter OTP code");
    }

    try {
      setLoading(true);

      await publicApi.post("/auth/driver/set-password", {
        phone,
        otp,
        password,
      });

      Alert.alert("Success", "Account created successfully");

      // 🔥 هذا هو المفتاح
      await clearApplicationPending();

    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Invalid OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 22, marginBottom: 20, textAlign: "center" }}>
        Enter OTP Code
      </Text>

      <TextInput
        placeholder="OTP"
        keyboardType="numeric"
        value={otp}
        onChangeText={setOtp}
        style={{
          borderWidth: 1,
          padding: 12,
          marginBottom: 20,
          borderRadius: 8,
          textAlign: "center",
          fontSize: 18,
        }}
      />

      <TouchableOpacity
        onPress={handleVerify}
        disabled={loading}
        style={{
          backgroundColor: "#000",
          padding: 15,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff" }}>Verify</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}