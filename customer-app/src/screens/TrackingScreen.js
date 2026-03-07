import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import socket from "../socket";
import api from "../api/api";

const { height } = Dimensions.get("window");

export default function TrackingScreen({ route }) {

  const { orderId } = route.params;

  const [order, setOrder] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [eta, setEta] = useState(null);

  /* ===============================
     Load Order
  ================================= */

  useEffect(() => {

    const loadOrder = async () => {

      try {

        const res = await api.get(`/orders/${orderId}`);

        setOrder(res.data);

      } catch (error) {

        console.log("ORDER LOAD ERROR:", error);

      }

    };

    loadOrder();

  }, []);

  /* ===============================
     Socket Tracking
  ================================= */

  useEffect(() => {

    if (!order) return;

    socket.emit("joinOrderRoom", order._id);

    socket.on("liveLocation", ({ lat, lng }) => {

      setDriverLocation({
        latitude: lat,
        longitude: lng
      });

      const customerLat =
        order.deliveryLocation.coordinates[1];

      const customerLng =
        order.deliveryLocation.coordinates[0];

      const distance =
        Math.sqrt(
          Math.pow(lat - customerLat, 2) +
          Math.pow(lng - customerLng, 2)
        ) * 111;

      const estimatedMinutes =
        Math.round(distance * 2);

      setEta(estimatedMinutes);

    });

    return () => {
      socket.off("liveLocation");
    };

  }, [order]);

  if (!order) {

    return (
      <View style={styles.loading}>
        <Text>Loading order...</Text>
      </View>
    );

  }

  const customerLat =
    order.deliveryLocation.coordinates[1];

  const customerLng =
    order.deliveryLocation.coordinates[0];

  return (

    <View style={{ flex: 1 }}>

      <MapView
        style={{ flex: 1 }}
        region={{
          latitude:
            driverLocation?.latitude ||
            customerLat,

          longitude:
            driverLocation?.longitude ||
            customerLng,

          latitudeDelta: 0.01,
          longitudeDelta: 0.01
        }}
      >

        {/* Customer */}

        <Marker
          coordinate={{
            latitude: customerLat,
            longitude: customerLng
          }}
          title="You"
          pinColor="green"
        />

        {/* Driver */}

        {driverLocation && (

          <Marker
            coordinate={driverLocation}
            title="Driver"
            pinColor="red"
          />

        )}

        {/* Route Line */}

        {driverLocation && (

          <Polyline
            coordinates={[
              driverLocation,
              {
                latitude: customerLat,
                longitude: customerLng
              }
            ]}
            strokeWidth={4}
            strokeColor="#2980b9"
          />

        )}

      </MapView>

      {/* Bottom Panel */}

      <View style={styles.panel}>

        <Text style={styles.title}>
          Order Tracking
        </Text>

        {eta && (
          <Text style={styles.eta}>
            ETA: {eta} minutes
          </Text>
        )}

        {!driverLocation && (
          <Text style={styles.wait}>
            Waiting for driver location...
          </Text>
        )}

      </View>

    </View>

  );

}

const styles = StyleSheet.create({

  panel: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: height * 0.22,
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10
  },

  title: {
    fontSize: 18,
    fontWeight: "bold"
  },

  eta: {
    marginTop: 10,
    fontSize: 16,
    color: "#27ae60"
  },

  wait: {
    marginTop: 10,
    color: "gray"
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }

});