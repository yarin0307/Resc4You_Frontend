import ProgressBar from "../Components/ProgressBar";
import {
  View,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  TouchableOpacity,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import React, { useContext, useState, useEffect, useRef } from "react";
import MainNavbar from "../Components/MainNavbar";
import Icon from "react-native-vector-icons/FontAwesome5";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, off } from "firebase/database";
import firebaseConfig from "../firebaseConfig";
import { useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../Context/AuthProvider";
import axios from "axios";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { MAPS_API_KEY } from "@env";

const labels = ["Reported", "On The Way", "Problem Solved"];
const apiGetOpenRequestCitizen =
  "GetCitizenOpenRequest/";
export default function CitizenRequestStatusBPage(props) {
  const [currentPosition, setCurrentPosition] = useState(1);
  const { user, setUser } = useContext(AuthContext);
  const [origin, setOrigin] = useState({
    latitude: 32.3248525,
    longitude: 34.8521025,
  });
  const [destination, setDestination] = useState({
    latitude: 32.322913,
    longitude: 34.849942,
  });
  const [carLocation, setCarLocation] = useState({
    latitude: origin.latitude,
    longitude: origin.longitude,
  });

  const mapRef = useRef(null);

  const [arrivalTime, setArrivalTime] = useState("");
  const API_KEY = MAPS_API_KEY;
  const calculateETA = () => {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${carLocation.latitude},${carLocation.longitude}&destination=${destination.latitude},${destination.longitude}&key=${API_KEY}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const travelTime = data.routes[0].legs[0].duration.value;
        console.log(travelTime);
        const minutes = Math.floor(travelTime / 60);
        setArrivalTime(minutes);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  var requestRef;
  var VolunteerRef;

  useEffect(() => {
    calculateETA();
  }, [carLocation]);

  useEffect(() => {
    mapRef.current.animateToRegion({
      latitude: destination.latitude,
      longitude: destination.longitude,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    });
  }, []);
  const app = initializeApp(firebaseConfig);

  function listenToRequestStatus(requestId) {
    const db = getDatabase(app);
    requestRef = ref(db, "Requests/" + requestId);
    onValue(
      requestRef,
      (snapshot) => {
        const request = snapshot.val();
        getOriginAndDestination(request.phone);
        listenToVolunteerLocation(request.phone);
        if (request.Status === "Waiting") {
          props.navigation.navigate("CitizenRequestStatusAPage", {
            requestId: props.route.params.requestId,
          });
        } else if (request.Status === "Closed") {
          props.navigation.navigate("CitizenRequestStatusCPage", {
            requestId: props.route.params.requestId,
          });
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  function listenToVolunteerLocation(VolunteerPhone) {
    const db = getDatabase(app);
    VolunteerRef = ref(db, "Volunteers/" + VolunteerPhone);
    onValue(VolunteerRef, (snapshot) => {
      const location = snapshot.val();
      setCarLocation({
        latitude: location.Latitude,
        longitude: location.Longitude,
      });
    });
  }
  const getOriginAndDestination = (volunteerPhone) => {
    axios
      .get(
        `GetRequestAndVolunteerLocation/${props.route.params.requestId}/volunteerPhone/${volunteerPhone}`
      )
      .then((res) => {
        console.log(res.data[0]);
        setOrigin({
          latitude: res.data[0].volunteerLatitude,
          longitude: res.data[0].volunteerLongitude,
        });
        setDestination({
          latitude: res.data[0].requestLatitude,
          longitude: res.data[0].requestLongitude,
        });
      })
      .catch((error) => {
        console.log(error);
        // handle the error here
      });
  };

  useFocusEffect(
    React.useCallback(() => {
      axios
        .get(apiGetOpenRequestCitizen + user.Phone)
        .then((res) => {
          listenToRequestStatus(res.data[0].requestId);
        })
        .catch((err) => {
          alert(err.response.data);
        });
      return () => {
        off(requestRef);
        off(VolunteerRef);
      };
    }, [])
  );

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : null}
        keyboardVerticalOffset={Platform.OS === "android" ? 0 : 100}
        style={{ flex: 1, backgroundColor: "white" }}
      >
        <MainNavbar />

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <ProgressBar
              currentPosition={currentPosition}
              labels={labels}
              stepCount={labels.length}
            />

            <View>
              <MapView
                style={styles.map}
                ref={mapRef}
                initialRegion={{
                  latitude: destination.latitude,
                  longitude: destination.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                region={origin}
              >
                <Marker coordinate={origin} />

                <Marker coordinate={destination} pinColor="green" />
                <Marker
                  coordinate={carLocation}
                  title="My Car"
                  description="This is my car"
                >
                  <Icon name="car-side" size={30} color="black" />
                </Marker>
                <MapViewDirections
                  origin={origin}
                  destination={destination}
                  apikey={API_KEY}
                  strokeWidth={3}
                  strokeColor="hotpink"
                />
              </MapView>
            </View>
            <Text>Arrival in: {arrivalTime} minute </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  map: {
    flex: 1,
    height: 400,
    marginTop: 50,
  },
});
