import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { publicApi } from "../api/api";
import { AuthContext } from "../context/AuthContext";

export default function DriverApplyScreen() {
  const { markApplicationPending } = useContext(AuthContext);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    nationalId: "",
    licenseNumber: "",
    vehicleType: "car", // قيمة افتراضية صحيحة
  });

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const submit = async () => {
    try {
      if (
        !form.fullName ||
        !form.phone ||
        !form.nationalId ||
        !form.licenseNumber
      ) {
        return Alert.alert(
          "Error",
          "Please fill all required fields"
        );
      }

      await publicApi.post("/driver/apply", form);

      // حفظ رقم الهاتف
      await AsyncStorage.setItem(
        "lastAppliedPhone",
        form.phone
      );

      // تفعيل حالة pending
      await markApplicationPending(true);

      Alert.alert(
        "Success",
        "Application submitted successfully"
      );

    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message ||
          "Application failed"
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Driver Application
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={form.fullName}
        onChangeText={(value) =>
          handleChange("fullName", value)
        }
      />

      <TextInput
        style={styles.input}
        placeholder="Email (optional)"
        value={form.email}
        onChangeText={(value) =>
          handleChange("email", value)
        }
      />

      <TextInput
        style={styles.input}
        placeholder="Phone"
        keyboardType="phone-pad"
        value={form.phone}
        onChangeText={(value) =>
          handleChange("phone", value)
        }
      />

      <TextInput
        style={styles.input}
        placeholder="National ID"
        value={form.nationalId}
        onChangeText={(value) =>
          handleChange("nationalId", value)
        }
      />

      <TextInput
        style={styles.input}
        placeholder="License Number"
        value={form.licenseNumber}
        onChangeText={(value) =>
          handleChange("licenseNumber", value)
        }
      />

      {/* 🔥 Dropdown Vehicle Type */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={form.vehicleType}
          onValueChange={(value) =>
            handleChange("vehicleType", value)
          }
        >
          <Picker.Item label="Car" value="car" />
          <Picker.Item label="Bike" value="bike" />
          <Picker.Item label="Motorcycle" value="motorcycle" />
        </Picker>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={submit}
      >
        <Text style={styles.buttonText}>
          Apply
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});