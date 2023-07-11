import ProgressBar from "../Components/ProgressBar";
import {
  View,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Dimensions } from "react-native";

import React, { useEffect, useState, useRef } from "react";
import MainNavbar from "../Components/MainNavbar";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { MAPS_API_KEY } from "@env";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

const labels = ["Problem", "Location", "Details"];

export default function CitizenRequestBPage(props) {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const problemType = props.route.params?.problemType;
  const [currentPosition, setCurrentPosition] = useState(1);
  const [region, setRegion] = useState(null);
  const [location, setLocation] = useState(null);
  const [searchText, setSearchText] = useState("");
  const mapRef = useRef(null);
  const googlePlacesRef = useRef(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          return;
        }

        const locationServicesEnabled =
          await Location.hasServicesEnabledAsync();
        if (!locationServicesEnabled) {
          return;
        }

        let { coords } = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        });
        setLocation({ latitude: coords.latitude, longitude: coords.longitude });

        let locationName = "";
        const geocode = await Location.reverseGeocodeAsync({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        if (geocode.length > 0) {
          const { name, street, city, region, country } = geocode[0];
          locationName = `${name ? name + ", " : ""}${
            street ? street + ", " : ""
          }${city ? city + ", " : ""}${region ? region + ", " : ""}${country}`;
        }
        setSearchText(locationName);
        if (googlePlacesRef.current) {
          setTimeout(() => {
            googlePlacesRef.current.setAddressText(locationName);
          }, 500);
        }
      })();
    }, [])
  );

  const handleNext = () => {
    if (!location) {
      alert("Please select a location");
      return;
    }
    props.navigation.navigate("CitizenRequestCPage", {
      problemType: problemType,
      problemAddress: searchText,
      problemLongitude: location.longitude,
      problemLatitude: location.latitude,
    });
  };

  const handlePlaceSelected = (data, details) => {
    setSearchText(data.description);
    const { lat, lng } = details.geometry.location;
    setRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.015,
      longitudeDelta: 0.0121,
    });
    setLocation({ latitude: lat, longitude: lng });
    mapRef.current.animateToRegion(region, 500);
  };
  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <MainNavbar />
        <View>
          <ProgressBar
            currentPosition={currentPosition}
            labels={labels}
            stepCount={labels.length}
          />
        </View>
        <View style={styles.container}>
          <GooglePlacesAutocomplete
            ref={googlePlacesRef}
            placeholder="Search location"
            onPress={handlePlaceSelected}
            fetchDetails={true}
            styles={{ textInput: styles.input }}
            query={{
              key: MAPS_API_KEY,
              language: "en",
              types: ["address"],
            }}
          />
          <View style={styles.mapContainer(keyboardVisible)}>
            <MapView
              ref={mapRef}
              style={styles.map}
              region={region}
              showsUserLocation={true}
              showsMyLocationButton={true}
              onRegionChangeComplete={(region) => setRegion(region)}
            >
              {location && <Marker coordinate={location} />}
            </MapView>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "red" }]}
              onPress={() => props.navigation.goBack()}
            >
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "green" }]}
              onPress={handleNext}
            >
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = {
  container: {
    flex: 1,
  },
  mapContainer: (keyboardVisible) => ({
    flex: keyboardVisible ? 1 : 4,
    height: keyboardVisible ? Dimensions.get("window").height / 3 : "100%",
  }),
  map: {
    width: "100%",
    height: "100%",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: 10,
  },
  button: {
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  inputContainer: {
    alignItems: "center",
  },
  input: {
    width: "80%",
    height: 50,
    borderWidth: 1,
    paddingLeft: 15,
    marginTop: 10, // Reduce the marginTop value
    textAlign: "center",
  },
};
