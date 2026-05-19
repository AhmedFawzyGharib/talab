import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";

import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import DriverApplyScreen from "./screens/DriverApplyScreen";
import PendingScreen from "./screens/PendingScreen";
import SetPasswordScreen from "./screens/SetPasswordScreen";
import VerifyOtpScreen from "./screens/VerifyOtpScreen";
import ProfileScreen from "./screens/ProfileScreen";

import { AuthContext } from "./context/AuthContext";

const Stack = createNativeStackNavigator();

/* ===============================
   AUTH STACK
================================= */
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="DriverApply" component={DriverApplyScreen} />
    </Stack.Navigator>
  );
}

/* ===============================
   PENDING STACK
================================= */
function PendingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Pending" component={PendingScreen} />
      <Stack.Screen name="SetPassword" component={SetPasswordScreen} />
      <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
    </Stack.Navigator>
  );
}

/* ===============================
   APP STACK
================================= */
function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

/* ===============================
   ROOT NAVIGATION
================================= */
export default function Navigation() {
  const { userToken, loading, applicationPending } =
    useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userToken ? (
        <AppStack />
      ) : applicationPending ? (
        <PendingStack />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}