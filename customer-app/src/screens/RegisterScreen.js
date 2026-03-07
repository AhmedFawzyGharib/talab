import React, { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import api from "../api/api";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!name || !phone || !password) {
      return Alert.alert("Error", "All fields required");
    }

    try {
      await api.post("/auth/customer/register", {
        name,
        phone,
        password,
      });

      navigation.navigate("VerifyOtp", {
        name,
        phone,
        password,
      });

    } catch (err) {
      console.log("REGISTER ERROR:", err.response?.data || err.message);

      Alert.alert(
        "Error",
        err.response?.data?.message || "Registration failed"
      );
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />

      <TextInput
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, marginBottom: 20 }}
      />

      <Button title="Register" onPress={handleRegister} />
    </View>
  );
}