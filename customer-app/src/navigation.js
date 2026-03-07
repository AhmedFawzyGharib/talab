import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";

import { AuthContext } from "./context/AuthContext";
import CustomDeliveryScreen from "./screens/CustomDeliveryScreen";
/* ===============================
   AUTH SCREENS
================================= */

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import VerifyOtpScreen from "./screens/VerifyOtpScreen";

/* ===============================
   APP SCREENS
================================= */

import HomeScreen from "./screens/HomeScreen";
import MerchantsScreen from "./screens/MerchantsScreen";
import MerchantDetailsScreen from "./screens/MerchantDetailsScreen";
import CartScreen from "./screens/CartScreen";
import SelectLocationScreen from "./screens/SelectLocationScreen";
import OrderSummaryScreen from "./screens/OrderSummaryScreen";
import TrackingScreen from "./screens/TrackingScreen";
import MyOrdersScreen from "./screens/MyOrdersScreen";

const Stack = createNativeStackNavigator();

/* ===============================
   AUTH STACK
================================= */

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      
      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />

      <Stack.Screen
        name="Register"
        component={RegisterScreen}
      />

      <Stack.Screen
        name="VerifyOtp"
        component={VerifyOtpScreen}
      />

    </Stack.Navigator>
  );
}

/* ===============================
   APP STACK
================================= */

function AppStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerBackTitleVisible: false }}
    >

      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Home" }}
      />

      <Stack.Screen
        name="Merchants"
        component={MerchantsScreen}
        options={{ title: "Shops & Restaurants" }}
      />

      <Stack.Screen
        name="MerchantDetails"
        component={MerchantDetailsScreen}
        options={({ route }) => ({
          title: route.params?.merchantName || "Details",
        })}
      />

      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: "Your Cart" }}
      />

      <Stack.Screen
        name="SelectLocation"
        component={SelectLocationScreen}
        options={{ title: "Select Delivery Location" }}
      />

      <Stack.Screen
        name="OrderSummary"
        component={OrderSummaryScreen}
        options={{ title: "Order Summary" }}
      />
       
       <Stack.Screen
           name="CustomDelivery"
           component={CustomDeliveryScreen}
           options={{ title: "Custom Delivery" }}
        />

      <Stack.Screen
        name="Tracking"
        component={TrackingScreen}
        options={{
          title: "Live Tracking",
          headerBackVisible: false
        }}
      />

      <Stack.Screen
        name="MyOrders"
        component={MyOrdersScreen}
        options={{ title: "My Orders" }}
      />

    </Stack.Navigator>
  );
}

/* ===============================
   ROOT NAVIGATION
================================= */

export default function Navigation() {

  const { userToken, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>

      {userToken
        ? <AppStack />
        : <AuthStack />
      }

    </NavigationContainer>
  );
}