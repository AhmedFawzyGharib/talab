import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
 TouchableOpacity,
  Text,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

export default function SelectLocationScreen({ route, navigation }) {

  const { onSelect } = route.params || {};

  const [region, setRegion] = useState({
    latitude: 24.7136,
    longitude: 46.6753,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03,
  });

  const [selectedLocation, setSelectedLocation] = useState(null);

  /* ===============================
     Use Current Location
  ================================= */

  const handleUseCurrentLocation = async () => {

    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      return Alert.alert("Permission denied");
    }

    const location =
      await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

    const { latitude, longitude } = location.coords;

    setRegion({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });

    setSelectedLocation({ latitude, longitude });

  };

  /* ===============================
     Confirm Location
  ================================= */

  const handleConfirmLocation = () => {

    if (!selectedLocation) {
      return Alert.alert("Please select a location");
    }

    if (onSelect) {
      onSelect(selectedLocation);
    }

    navigation.goBack();

  };

  return (
    <View style={styles.container}>

      <MapView
        style={styles.map}
        region={region}
        onPress={(e) => {

          const { latitude, longitude } =
            e.nativeEvent.coordinate;

          setSelectedLocation({ latitude, longitude });

        }}
        onRegionChangeComplete={(newRegion) =>
          setRegion(newRegion)
        }
      >

        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            draggable
            onDragEnd={(e) => {

              const { latitude, longitude } =
                e.nativeEvent.coordinate;

              setSelectedLocation({
                latitude,
                longitude,
              });

            }}
          />
        )}

      </MapView>

      <View style={styles.buttonsContainer}>

        <TouchableOpacity
          style={[styles.smallButton, styles.green]}
          onPress={handleUseCurrentLocation}
        >
          <Text style={styles.buttonText}>
            My Location
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.smallButton, styles.blue]}
          onPress={handleConfirmLocation}
        >
          <Text style={styles.buttonText}>
            Confirm
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  map: {
    flex: 1,
  },

  buttonsContainer: {
    position: "absolute",
    bottom: 25,
    left: 15,
    right: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  smallButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    elevation: 4,
  },

  green: {
    backgroundColor: "#2ecc71",
    marginRight: 8,
  },

  blue: {
    backgroundColor: "#3498db",
    marginLeft: 8,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

});