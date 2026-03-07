import React, { useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from "react-native";

import { AuthContext } from "../context/AuthContext";

export default function HomeScreen({ navigation }) {

  const { logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Welcome 👋
      </Text>

      {/* Browse Merchants */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Merchants")}
      >
        <Text style={styles.buttonText}>
          Browse Shops
        </Text>
      </TouchableOpacity>
       
      <TouchableOpacity
      style={styles.button}
        onPress={() => navigation.navigate("CustomDelivery")}
         >
         <Text style={styles.buttonText}>
             Request Custom Delivery
          </Text>
       </TouchableOpacity>

      {/* My Orders */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("MyOrders")}
      >
        <Text style={styles.buttonText}>
          My Orders
        </Text>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={logout}
      >
        <Text style={styles.logoutText}>
          Logout
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5"
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 40
  },

  button: {
    backgroundColor: "#4f46e5",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 20,
    width: 220,
    alignItems: "center"
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  },

  logoutButton: {
    marginTop: 40,
    backgroundColor: "red",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10
  },

  logoutText: {
    color: "#fff",
    fontWeight: "bold"
  }

});