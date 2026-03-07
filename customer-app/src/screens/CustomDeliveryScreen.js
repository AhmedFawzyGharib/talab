import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert
} from "react-native";

import * as Location from "expo-location";
import api from "../api/api";

export default function CustomDeliveryScreen({ navigation }) {

  const [pickupLocation, setPickupLocation] = useState(null);
  const [deliveryLocation, setDeliveryLocation] = useState(null);

  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const [pickupName, setPickupName] = useState("");
  const [orderNote, setOrderNote] = useState("");

  /* ===============================
     Reverse Geocode
  ================================= */

  const getAddressFromCoords = async (lat, lng) => {

    try {

      const address = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng
      });

      if (address.length > 0) {

        const a = address[0];

        return `${a.name || ""} ${a.street || ""} ${a.city || ""}`;

      }

      return "Unknown location";

    } catch (err) {

      return "Unknown location";

    }

  };

  /* ===============================
     Select Pickup Location
  ================================= */

  const selectPickup = () => {

    navigation.navigate("SelectLocation", {

      onSelect: async (location) => {

        setPickupLocation(location);

        const address = await getAddressFromCoords(
          location.latitude,
          location.longitude
        );

        setPickupAddress(address);

      }

    });

  };

  /* ===============================
     Select Delivery Location
  ================================= */

  const selectDelivery = () => {

    navigation.navigate("SelectLocation", {

      onSelect: async (location) => {

        setDeliveryLocation(location);

        const address = await getAddressFromCoords(
          location.latitude,
          location.longitude
        );

        setDeliveryAddress(address);

      }

    });

  };

  /* ===============================
     Request Driver
  ================================= */

  const handleRequestDriver = async () => {

    if (!pickupLocation) {
      return Alert.alert("Select pickup location");
    }

    if (!deliveryLocation) {
      return Alert.alert("Select delivery location");
    }

    try {

      await api.post("/orders/custom-delivery", {

        pickupName,
        note: orderNote,

        pickupLocation: {
          latitude: pickupLocation.latitude,
          longitude: pickupLocation.longitude
        },

        deliveryLocation: {
          latitude: deliveryLocation.latitude,
          longitude: deliveryLocation.longitude
        },

        deliveryAddress

      });

      Alert.alert("Driver requested");

      navigation.navigate("Home");

    } catch (error) {

      console.log(error.response?.data);

      Alert.alert("Failed to request driver");

    }

  };

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Custom Delivery
      </Text>

      {/* Pickup */}

      <TouchableOpacity
        style={styles.locationButton}
        onPress={selectPickup}
      >
        <Text style={styles.buttonText}>
          Select Pickup Location
        </Text>
      </TouchableOpacity>

      <Text style={styles.locationText}>
        {pickupAddress || "No pickup location selected"}
      </Text>

      <TextInput
        placeholder="Place name (Supermarket, Pharmacy)"
        value={pickupName}
        onChangeText={setPickupName}
        style={styles.input}
      />

      {/* Delivery */}

      <TouchableOpacity
        style={styles.locationButton}
        onPress={selectDelivery}
      >
        <Text style={styles.buttonText}>
          Select Delivery Location
        </Text>
      </TouchableOpacity>

      <Text style={styles.locationText}>
        {deliveryAddress || "No delivery location selected"}
      </Text>

      <TextInput
        placeholder="What should the driver buy?"
        value={orderNote}
        onChangeText={setOrderNote}
        style={styles.input}
        multiline
      />

      <TouchableOpacity
        style={styles.requestButton}
        onPress={handleRequestDriver}
      >
        <Text style={styles.buttonText}>
          Request Driver
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
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },

  locationButton: {
    backgroundColor: "#3498db",
    padding: 15,
    borderRadius: 8,
    marginBottom: 5,
    alignItems: "center",
  },

  locationText: {
    marginBottom: 15,
    color: "#555",
    fontSize: 14,
  },

  requestButton: {
    backgroundColor: "#27ae60",
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

});