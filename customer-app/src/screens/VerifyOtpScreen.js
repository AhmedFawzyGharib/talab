import React, { useState, useContext } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";

export default function VerifyOtpScreen({ route }) {
  const { name, phone, password } = route.params;
  const { setTokenDirectly } = useContext(AuthContext);

  const [otp, setOtp] = useState("");

  const handleVerify = async () => {
    try {
      const res = await api.post(
        "/auth/customer/verify-otp",
        {
          name,
          phone,
          password,
          otp: otp.trim().toString(),   // 🔥 مهم جدًا
        }
      );

      await setTokenDirectly(res.data.token);

    } catch (err) {
      console.log("VERIFY ERROR:", err.response?.data);

      Alert.alert(
        "Error",
        err.response?.data?.message || "Invalid OTP"
      );
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Enter OTP"
        keyboardType="numeric"
        value={otp}
        onChangeText={setOtp}
        style={{ borderWidth: 1, marginBottom: 20 }}
      />

      <Button title="Verify" onPress={handleVerify} />
    </View>
  );
}