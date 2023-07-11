import React, { useEffect, useState, useRef, useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Linking } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native";

import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Modal
} from "react-native";
import MainNavbar from "../Components/MainNavbar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import RequestCardVolunteer from "../Components/RequestCardVolunteer";
import { StyleSheet } from "react-native";
import RequestDetailsModal from "../Components/RequestDetailsModal";
import { sendPushNotification } from "../PushNotification/sendPushNotification";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { AuthContext } from "../Context/AuthProvider";
import { getDatabase, ref, onValue, set } from "firebase/database";
import { initializeApp } from "firebase/app";
import firebaseConfig from "../firebaseConfig";
import LoadingSpinner from "../Components/LoadingSpinner";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function MyRequestsVolunteerPage(props) {
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [notification, setNotification] = useState(false);
  const [handleRequestList, setHandleRequestList] = useState([]);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState(null);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [showModalDetails, setShowModalDetails] = useState(false);
  const phone = props.route.params?.phone;

  const app = initializeApp(firebaseConfig);
  function UpdateRequestInFireBase(requestId, status) {
    const db = getDatabase(app);
    const requestRef = ref(db, "Requests/" + requestId);
    set(requestRef, {
      Status: status,
    });
  }

  const HandleRequestVolunteerApi =
    "VolunteerHandleRequest/";
  const CancelRequestVolunteerApi =
    "RequestToCancel/";
  const handleCloseRequestApi =
    "UpdateRequestStatusToClose/";
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => { });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const handleCancelRequest = (requestId, citizenPushToken) => {
    Alert.alert(
      "Cancel Request",
      "Are you sure you want to cancel this request?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => {
            axios
              .put(CancelRequestVolunteerApi + `${requestId}`)
              .then((res) => {
                setHandleRequestList(
                  handleRequestList.filter((req) => req.requestId !== requestId)
                );
                const message = {
                  title: "Update for your request",
                  body: `we are sorry, ${user.FName} ${user.LName} won't be able to come we are looking for another volunteer`,
                  screen: "CitizenRequestStatusAPage",
                };
                UpdateRequestInFireBase(requestId, "Waiting");
                sendPushNotification(citizenPushToken, message);
              })
              .catch((err) => {
                alert(err.response.data);
              });
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleCloseRequest = async (requestId) => {
    setLoadingLocation(true);
    try {
      const { address, lat, long } = await getLocation();
      console.log(address);
      console.log(long);
      console.log(lat);

      await axios
        .put(handleCloseRequestApi + `${requestId}/Phone/${user.Phone}/address/${address}/long/${long}/lat/${lat}`)
        .then((res) => {
          UpdateRequestInFireBase(requestId, "Closed");
          setLoadingLocation(false);
          props.navigation.navigate("Available Requests");
        })
        .catch((err) => {
          alert(err.response.data);
        });
    } catch (error) {
      alert("Error getting location, please try again")
    }
  };

  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLoadingLocation(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync();
      // Reverse geocode the current location to get the address
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.coords.latitude}&lon=${location.coords.longitude}`
      );

      const data = await response.json();

      const houseNumber = data.address.house_number ? `, ${data.address.house_number}` : "";
      const address = `${data.address.road}${houseNumber}, ${data.address.city}, ${data.address.country}`;
      const lat = location.coords.latitude;
      const long = location.coords.longitude;

      return { address, lat, long };
    } catch (error) {
      console.error("Error getting location", error);
      setLoadingLocation(false);
      throw error;
    }
  };



  const handleShowModalDetails = (requestId) => {
    const selectedRequest = handleRequestList.find(
      (req) => req.requestId === requestId
    );
    setSelectedRequestId(requestId);
    setSelectedRequestDetails(selectedRequest);
    setShowModalDetails(true);
  };

  useFocusEffect(
    React.useCallback(() => {
      async function getTokenDetails() {
        try {
          const res = await axios.get(
            HandleRequestVolunteerApi + `${await AsyncStorage.getItem("Phone")}`
          )
            .then((res) => {
              setHandleRequestList(
                res.data.sort((a, b) => b.requestId - a.requestId)
              );
              setLoading(false);
            })
            .catch((err) => {
              console.log(err.response.data);
            });
        } catch (error) {
          console.log(error);
        }
      }
      getTokenDetails();
      return () => {
        setLoading(true);
      };
    }, [])
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : null}
      keyboardVerticalOffset={Platform.OS === "android" ? 0 : 100}
      style={{ flex: 1, backgroundColor: "white" }}
    >
      <MainNavbar />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {loadingLocation && (
            <Modal
              visible={loadingLocation}
              animationType="slide"
            >
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <ActivityIndicator size="large" color="blue" />
                  <Text style={styles.loadingText}>Fetching location...</Text>
                </View>
              </View>
            </Modal>

          )}
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              marginVertical: 20,
            }}
          >
            My Requests
          </Text>
          {handleRequestList.map((req, index) => (
            <RequestCardVolunteer
              key={index}
              requestIcon={req.specialtyIcon}
              requestType={req.specialtyName}
              requestDate={req.requestDate}
              requestLocation={req.requestAddress}
              requestStatus={req.requestStatus}
              requestId={req.requestId}
              from="My"
              citizenPushToken={req.citizenExpo_push_token}
              cancelRequest={handleCancelRequest}
              showDetails={handleShowModalDetails}
              closeRequest={handleCloseRequest}
            />
          ))}
          <RequestDetailsModal
            showModalDetails={showModalDetails}
            setShowModalDetails={setShowModalDetails}
            selectedRequestDetails={selectedRequestDetails}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = {
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 50,
    marginTop: -70,
  },
  formContainer: {
    width: "80%",
  },
  label: {
    fontSize: 16,
    paddingTop: 5,
  },
  signUpButton: {
    borderRadius: 50,
    padding: 10,
    margin: 10,
    backgroundColor: "#3DDC84",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseButton: {
    position: "absolute",
    top: 5,
    right: 5,
  },
  modalContent: {
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    color: "black",
  },
  modalButton: {
    backgroundColor: "#26BAE8",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  modalDetailsButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    marginTop: 10,
  },
};

