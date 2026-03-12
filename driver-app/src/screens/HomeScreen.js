import React, { useEffect, useState, useRef, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert
} from "react-native";

import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";

import api from "../api/api";
import socket from "../socket";
import { AuthContext } from "../context/AuthContext";

export default function HomeScreen(){

  const { logout } = useContext(AuthContext);

  const [orders,setOrders] = useState([]);
  const [activeOrder,setActiveOrder] = useState(null);
  const [selectedOrder,setSelectedOrder] = useState(null);

  const trackingInterval = useRef(null);
  const refreshInterval = useRef(null);

  /* ===============================
     LOGOUT
  ================================= */

  const handleLogout = () => {

    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to logout?",
      [
        { text:"Cancel",style:"cancel" },
        {
          text:"Logout",
          style:"destructive",
          onPress:async ()=>{
            stopTracking();
            clearInterval(refreshInterval.current);
            socket.disconnect();
            await logout();
          }
        }
      ]
    );

  };

  /* ===============================
     FETCH ORDERS
  ================================= */

  const fetchOrders = async ()=>{

    try{

      const res = await api.get("/orders/available");

      setOrders(res.data);

    }catch(err){

      console.log("LOAD ORDERS ERROR:",err.response?.data);

    }

  };

  /* ===============================
     CHECK ACTIVE ORDER
  ================================= */

  const checkActiveOrder = async ()=>{

    try{

      const res = await api.get("/orders/driver/active");

      if(res.data){

        setActiveOrder(res.data);

        socket.emit("joinOrderRoom",res.data._id);

        startLiveTracking(res.data._id);

      }else{

        fetchOrders();

      }

    }catch(err){

      console.log("ACTIVE ORDER ERROR:",err.response?.data);

    }

  };

  useEffect(()=>{

    checkActiveOrder();

    refreshInterval.current = setInterval(()=>{

      if(!activeOrder) fetchOrders();

    },8000);

    return ()=>{

      stopTracking();
      clearInterval(refreshInterval.current);

    };

  },[]);

  /* ===============================
     LIVE TRACKING
  ================================= */

  const startLiveTracking = async(orderId)=>{

    if(trackingInterval.current) return;

    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if(status !== "granted"){

      Alert.alert("Location permission denied");

      return;

    }

    trackingInterval.current = setInterval(async ()=>{

      try{

        const location =
          await Location.getCurrentPositionAsync({});

        const { latitude,longitude } =
          location.coords;

        socket.emit("driverLocationUpdate",{
          orderId,
          lat:latitude,
          lng:longitude
        });

      }catch(err){

        console.log("LOCATION ERROR:",err);

      }

    },5000);

  };

  const stopTracking = ()=>{

    if(trackingInterval.current){

      clearInterval(trackingInterval.current);
      trackingInterval.current = null;

    }

  };

  /* ===============================
     ACCEPT ORDER
  ================================= */

  const handleAccept = async(order)=>{

    try{

      const res = await api.put(`/orders/${order._id}/accept`);

      setActiveOrder(res.data.order);
      setOrders([]);

      socket.emit("joinOrderRoom",order._id);

      startLiveTracking(order._id);

    }catch{

      Alert.alert("Order already taken");

    }

  };

  /* ===============================
     UPDATE STATUS
  ================================= */

  const updateStatus = async(status)=>{

    try{

      const res = await api.put(
        `/orders/${activeOrder._id}/status`,
        { status }
      );

      setActiveOrder(res.data.order);

      if(status === "delivered"){

        stopTracking();

        setTimeout(()=>{
          setActiveOrder(null);
          fetchOrders();
        },3000);

      }

    }catch(err){

      console.log("STATUS ERROR:",err.response?.data);

    }

  };

  /* ===============================
     ORDER DETAILS SCREEN (قبل القبول)
  ================================= */

  if(selectedOrder){

    const pickup =
      selectedOrder.pickups?.[0]?.location?.coordinates;

    const delivery =
      selectedOrder.deliveryLocation?.coordinates;

    const pickupLat = pickup ? pickup[1] : null;
    const pickupLng = pickup ? pickup[0] : null;

    const deliveryLat = delivery ? delivery[1] : null;
    const deliveryLng = delivery ? delivery[0] : null;

    return(

      <View style={{flex:1}}>

        {pickupLat && deliveryLat && (

          <MapView
            style={{flex:1}}
            initialRegion={{
              latitude:pickupLat,
              longitude:pickupLng,
              latitudeDelta:0.05,
              longitudeDelta:0.05
            }}
          >

            <Marker
              coordinate={{
                latitude:pickupLat,
                longitude:pickupLng
              }}
              title="Pickup"
              pinColor="green"
            />

            <Marker
              coordinate={{
                latitude:deliveryLat,
                longitude:deliveryLng
              }}
              title="Delivery"
              pinColor="red"
            />

            <Polyline
              coordinates={[
                { latitude:pickupLat, longitude:pickupLng },
                { latitude:deliveryLat, longitude:deliveryLng }
              ]}
              strokeWidth={4}
              strokeColor="blue"
            />

          </MapView>

        )}

        <View style={styles.panel}>

          <Text style={styles.title}>Order Details</Text>

          {selectedOrder.pickups?.length > 0 && (

            <View style={styles.itemsBox}>

              <Text style={styles.itemsTitle}>
                📍 Pickup
              </Text>

              <Text>
                {selectedOrder.pickups[0].name}
              </Text>

              {selectedOrder.pickups[0].note && (

                <Text>
                  Items: {selectedOrder.pickups[0].note}
                </Text>

              )}

            </View>

          )}

          <View style={styles.itemsBox}>

            <Text style={styles.itemsTitle}>
              📍 Delivery
            </Text>

            <Text>
              {selectedOrder.deliveryAddress || "Customer Location"}
            </Text>

          </View>

          {selectedOrder.distance && (
            <Text>📏 Distance: {selectedOrder.distance} km</Text>
          )}

          {selectedOrder.totalPrice && (
            <Text>💰 Estimated Price: {selectedOrder.totalPrice} SAR</Text>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={()=>handleAccept(selectedOrder)}
          >
            <Text style={styles.buttonText}>
              Accept Order
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={()=>setSelectedOrder(null)}
          >
            <Text style={styles.buttonText}>
              Back
            </Text>
          </TouchableOpacity>

        </View>

      </View>

    );

  }

  /* ===============================
     ACTIVE ORDER SCREEN
  ================================= */

  if(activeOrder?.deliveryLocation?.coordinates){

    const lat =
      activeOrder.deliveryLocation.coordinates[1];

    const lng =
      activeOrder.deliveryLocation.coordinates[0];

    return(

      <View style={{flex:1}}>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <MapView
          style={{flex:1}}
          initialRegion={{
            latitude:lat,
            longitude:lng,
            latitudeDelta:0.01,
            longitudeDelta:0.01
          }}
        >

          <Marker
            coordinate={{ latitude:lat,longitude:lng }}
            title="Customer"
            pinColor="green"
          />

        </MapView>

        <View style={styles.panel}>

          <Text style={styles.title}>Active Order</Text>

          <Text>Status: {activeOrder.status}</Text>

          <Text>Total: {activeOrder.totalPrice || 0} SAR</Text>

          <TouchableOpacity
            style={styles.navigateButton}
            onPress={()=>Linking.openURL(
              `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
            )}
          >
            <Text style={styles.buttonText}>
              Navigate
            </Text>
          </TouchableOpacity>

          {activeOrder.status === "accepted" && (
            <Button text="Picked" onPress={()=>updateStatus("picked")} />
          )}

          {activeOrder.status === "picked" && (
            <Button text="On The Way" onPress={()=>updateStatus("on_the_way")} />
          )}

          {activeOrder.status === "on_the_way" && (
            <Button text="Delivered" onPress={()=>updateStatus("delivered")} />
          )}

        </View>

      </View>

    );

  }

  /* ===============================
     AVAILABLE ORDERS
  ================================= */

  return(

    <View style={styles.container}>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <FlatList
        data={orders}
        keyExtractor={(item)=>item._id}
        renderItem={({ item })=>(

          <View style={styles.card}>

            <Text>
              Order #{item._id.slice(-5)}
            </Text>

            <Text>
              Type: {item.type === "custom"
                ? "Custom Delivery"
                : "Merchant"}
            </Text>

            <TouchableOpacity
              style={styles.detailsButton}
              onPress={()=>setSelectedOrder(item)}
            >
              <Text style={styles.buttonText}>
                View Details
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={()=>handleAccept(item)}
            >
              <Text style={styles.buttonText}>
                Accept Order
              </Text>
            </TouchableOpacity>

          </View>

        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No available orders
          </Text>
        }
      />

    </View>

  );

}

const Button = ({ text,onPress })=>(
  <TouchableOpacity
    style={styles.button}
    onPress={onPress}
  >
    <Text style={styles.buttonText}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({

  container:{ flex:1,padding:20 },

  logoutButton:{
    backgroundColor:"#e74c3c",
    padding:10,
    borderRadius:8,
    alignItems:"center",
    marginBottom:10
  },

  logoutText:{ color:"#fff",fontWeight:"bold" },

  card:{
    backgroundColor:"#f1f1f1",
    padding:15,
    marginBottom:12,
    borderRadius:10
  },

  panel:{
    backgroundColor:"#fff",
    padding:20,
    borderTopLeftRadius:20,
    borderTopRightRadius:20
  },

  button:{
    backgroundColor:"#27ae60",
    padding:12,
    marginTop:12,
    borderRadius:8,
    alignItems:"center"
  },

  detailsButton:{
    backgroundColor:"#3498db",
    padding:12,
    marginTop:10,
    borderRadius:8,
    alignItems:"center"
  },

  cancelButton:{
    backgroundColor:"#7f8c8d",
    padding:12,
    marginTop:10,
    borderRadius:8,
    alignItems:"center"
  },

  navigateButton:{
    backgroundColor:"#8e44ad",
    padding:12,
    marginTop:10,
    borderRadius:8,
    alignItems:"center"
  },

  buttonText:{ color:"#fff",fontWeight:"bold" },

  title:{ fontSize:18,fontWeight:"bold",marginBottom:10 },

  empty:{ textAlign:"center",marginTop:40,color:"gray" },

  itemsBox:{
    marginTop:10,
    padding:10,
    backgroundColor:"#eee",
    borderRadius:8
  },

  itemsTitle:{ fontWeight:"bold",marginBottom:5 }

});