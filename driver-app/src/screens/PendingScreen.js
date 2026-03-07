import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import socket from "../socket";
import { publicApi } from "../api/api";

export default function PendingScreen({ navigation }) {

  const intervalRef = useRef(null);
  const phoneRef = useRef(null);

  useEffect(() => {

    const init = async () => {

      const phone = await AsyncStorage.getItem("lastAppliedPhone");

      if (!phone) {
        console.log("No stored phone found");
        return;
      }

      phoneRef.current = phone;

      /* ===============================
         REGISTER DRIVER IN SOCKET
      ================================= */

      socket.emit("registerDriver", phone);

      const handleSocketApproval = () => {
        console.log("Socket: Driver Approved");
        goToSetPassword();
      };

      socket.on("driverApproved", handleSocketApproval);

      /* ===============================
         CHECK IMMEDIATELY (NO WAIT)
      ================================= */

      try {
        const res = await publicApi.get(
          `/driver/status?phone=${phone}`
        );

        console.log("Initial STATUS:", res.data.status);

        if (res.data.status === "approved") {
          goToSetPassword();
        }

      } catch (err) {
        console.log(
          "Initial check failed:",
          err.response?.status,
          err.response?.data || err.message
        );
      }

      /* ===============================
         POLLING EVERY 5 SECONDS
      ================================= */

      intervalRef.current = setInterval(async () => {

        try {
          const res = await publicApi.get(
            `/driver/status?phone=${phone}`
          );

          console.log("Polling STATUS:", res.data.status);

          if (res.data.status === "approved") {
            goToSetPassword();
          }

        } catch (err) {
          console.log(
            "Polling error:",
            err.response?.status,
            err.response?.data || err.message
          );
        }

      }, 5000);
    };

    init();

    return () => {
      socket.off("driverApproved");

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };

  }, []);

  /* ===============================
     NAVIGATION TO SET PASSWORD
  ================================= */

  const goToSetPassword = () => {

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    navigation.reset({
      index: 0,
      routes: [
        {
          name: "SetPassword",
          params: { phone: phoneRef.current },
        },
      ],
    });
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <ActivityIndicator size="large" />

      <Text
        style={{
          marginTop: 20,
          fontSize: 16,
          textAlign: "center",
        }}
      >
        Application Under Review...
      </Text>
    </View>
  );
}