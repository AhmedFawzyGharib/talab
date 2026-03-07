import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";

export default function MerchantsScreen({ navigation }) {
  const [merchants, setMerchants] = useState([]);
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    loadMerchants();

    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            style={{ marginRight: 20 }}
            onPress={() => navigation.navigate("MyOrders")}
          >
            <Text style={{ fontWeight: "bold" }}>My Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogout}>
            <Text style={{ fontWeight: "bold", color: "red" }}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, []);

const handleLogout = () => {
  Alert.alert(
    "Confirm Logout",
    "Are you sure you want to logout?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          // لا تحتاج navigation.reset هنا
        },
      },
    ]
  );
};

  const loadMerchants = async () => {
    try {
      const res = await api.get("/merchants");
      setMerchants(res.data);
    } catch (error) {
      console.log("MERCHANT ERROR:", error.message);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("MerchantDetails", {
          merchantId: item._id,
          merchantName: item.name,
        })
      }
    >
      <Text style={styles.name}>{item.name}</Text>
      <Text>{item.category}</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={merchants}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 15 }}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    marginBottom: 10,
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
  },
});