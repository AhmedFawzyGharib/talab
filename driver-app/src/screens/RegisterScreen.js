import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import api from "../services/api";

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    nationalId: "",
    licenseNumber: "",
    vehicleType: "",
  });

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const submit = async () => {
    try {
      await api.post("/driver/apply", form);

      Alert.alert(
        "Success",
        "Application submitted. Wait for admin approval."
      );

      navigation.navigate("Login");
    } catch (err) {
      Alert.alert("Error", "Application failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Driver Application</Text>

      {Object.keys(form).map((key) => (
        <TextInput
          key={key}
          style={styles.input}
          placeholder={key}
          onChangeText={(value) =>
            handleChange(key, value)
          }
        />
      ))}

      <TouchableOpacity style={styles.button} onPress={submit}>
        <Text style={styles.buttonText}>Apply</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});