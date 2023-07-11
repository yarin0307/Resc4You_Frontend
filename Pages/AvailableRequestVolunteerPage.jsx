import React, { useEffect, useState, useRef, useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Linking } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Platform } from "react-native";
import * as BackgroundFetch from "expo-background-fetch";
import { ActivityIndicator } from "react-native";
import LoadingSpinner from "../Components/LoadingSpinner";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Modal,
  TouchableOpacity,
} from "react-native";
import MainNavbar from "../Components/MainNavbar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../Context/AuthProvider";
import * as Location from "expo-location";

import { StyleSheet } from "react-native";
import RequestCardVolunteer from "../Components/RequestCardVolunteer";
import RequestDetailsModal from "../Components/RequestDetailsModal";
import WazeNavigationModal from "../Components/WazeNavigationModal";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { sendPushNotification } from "../PushNotification/sendPushNotification";
import { getDatabase, ref, onValue, set } from "firebase/database";
import { initializeApp } from "firebase/app";
import firebaseConfig from "../firebaseConfig";
import { MAPS_API_KEY } from "@env";
import { Button } from "react-native-elements";
import MapModal from "../Components/MapModal";
import { KMContext } from "../Context/KMProvider";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function AvailableRequestVolunteerPage(props) {
  const [volunteerLocation, setVolunteerLocation] = useState({
    latitude: "",
    longitude: "",
  });
  const [loading, setLoading] = useState(true);

  const { user, setUser } = useContext(AuthContext);
  const { km, setKm } = useContext(KMContext);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState(null);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [notification, setNotification] = useState(false);
  const [showModalDetails, setShowModalDetails] = useState(false);
  const [requestList, setRequestList] = useState([]);
  const [requestAddress, setRequestAddress] = useState("");
  const phone = props.route.params?.phone;
  const [prevLocation, setPrevLocation] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [markers, setMarkers] = useState([]);

  const app = initializeApp(firebaseConfig);
  function UpdateRequestInFireBase(requestId, status) {
    const db = getDatabase(app);
    const requestRef = ref(db, "Requests/" + requestId);
    set(requestRef, {
      phone: user.Phone,
      Status: status,
    });
  }

  function UpdateVolunteerLocationInFireBase(latitude, longitude) {
    console.log("Volunteer location:", latitude, longitude);
    const db = getDatabase(app);
    const requestRef = ref(db, "Volunteers/" + user.Phone);
    set(requestRef, {
      Latitude: latitude,
      Longitude: longitude,
    });
  }
  const trackVolunteerLocation = async () => {
    console.log("Tracking volunteer location");
    try {
      //     // Check if the device supports geolocation
      const hasLocationServicesEnabled =
        await Location.hasServicesEnabledAsync();
      if (!hasLocationServicesEnabled) {
        console.log("Location services are not enabled");
        return;
      }

      // Request permission for location access
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission denied");
        return;
      }

      // Start tracking the user's location
      const location = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // update every 10 seconds
          distanceInterval: 10, // update every 10 meters
        },

        (position) => {
          const { latitude, longitude } = position.coords;
          // Write the location to console only if it has changed
          if (
            prevLocation === null ||
            prevLocation.latitude !== latitude ||
            prevLocation.longitude !== longitude
          ) {
          }

          // Update the prevLocation state variable
          setPrevLocation({ latitude, longitude });

          // Update the volunteerLocation state variable
          setVolunteerLocation({ latitude, longitude });
        }
      );
    } catch (error) {
      console.log("Error tracking location:", error);
    }
  };

  // Call the trackVolunteerLocation function in the useEffect hook
  useEffect(() => {
    trackVolunteerLocation();
  }, []);

  useEffect(() => {
    // const loggingFunction = () => {
    //   console.log("Volunteer location:", volunteerLocation);
    // };
    // const intervalId = setInterval(loggingFunction, 10000);
    UpdateVolunteerLocationInFireBase(
      volunteerLocation.latitude,
      volunteerLocation.longitude
    );
  }, [volunteerLocation]);

  const RequestApi = "VolunteerPhone/";
  const VolunteerDeclineRequestApi = "VolunteerPhone/";
  const VolunteerAcceptRequestApi = "VolunteerPhone/";
  const VolunteerNumOfHandelingRequest = "checkNumRequestHandling/";
  const requestAlreadyTaken = "RequestAlreadyTaken/";

  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const { notification } = response;
        const screenName = notification.request.content.data.screen; // get the screen name from the notification data
        props.navigation.navigate(screenName); // navigate to the specified screen
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const handleCancelRequest = (requestId) => {
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
              .put(
                VolunteerDeclineRequestApi + `${phone}/RequestId/${requestId}`
              )
              .then((res) => {
                setRequestList(
                  requestList.filter((req) => req.requestId !== requestId)
                );
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
  const handleLaunchWaze = () => {
    const wazeUrl = `https://www.waze.com/ul?q=${encodeURIComponent(
      requestAddress
    )}`;
    Linking.openURL(wazeUrl);
    setShowModal(false);
  };
  const handleAcceptRequest = (requestId, requestAddress, citizenPushToken) => {
    Alert.alert(
      "Accept Request",
      "Are you sure you want to accept this request?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => {
            axios
              .get(VolunteerNumOfHandelingRequest + `${phone}`)
              .then((res) => {
                if (res.data == 1) {
                  alert("you can't handle 2 requests at the same time");
                } else {
                  axios
                    .get(requestAlreadyTaken + `${requestId}`)
                    .then((res) => {
                      if (res.data == 1) {
                        alert(
                          "This request was already taken by another volunteer"
                        );
                        setRequestList(
                          requestList.filter(
                            (req) => req.requestId !== requestId
                          )
                        );
                      } else {
                        axios
                          .put(
                            VolunteerAcceptRequestApi +
                              `${phone}/RequestToHandle/${requestId}`
                          )
                          .then(async (res) => {
                            setRequestList(
                              requestList.filter(
                                (req) => req.requestId !== requestId
                              )
                            );

                            if (res.data === 0) {
                              alert(
                                "This request was already canceled by the citizen"
                              );
                              return;
                            }
                            UpdateRequestInFireBase(requestId, "In Progress");
                            setRequestAddress(requestAddress);
                            setShowModal(true);
                            const message = {
                              title: "Accept Request",
                              body: `${user.FName} ${user.LName}: ${user.Phone} accepted your request`,
                              screen: "CitizenRequestStatusAPage",
                            };
                            await sendPushNotification(
                              citizenPushToken,
                              message
                            );
                          })
                          .catch((err) => {
                            alert(err.response.data);
                          });
                      }
                    })
                    .catch((err) => {
                      alert(err.response.data);
                    });
                }
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

  const handleShowModalDetails = (requestId) => {
    const selectedRequest = requestList.find(
      (req) => req.requestId === requestId
    );
    setSelectedRequestId(requestId);
    setSelectedRequestDetails(selectedRequest);
    setShowModalDetails(true);
  };

  const handleShowMap = async () => {
    const requestMarkers = [];
    console.log(requestList);
    for (const address of requestList) {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${address.requestAddress}&key=${MAPS_API_KEY}`
      );
      const location = response.data.results[0].geometry.location;
      requestMarkers.push({
        coordinate: {
          latitude: location.lat,
          longitude: location.lng,
        },
        title: address.requestId,
      });
    }
    setMarkers(requestMarkers);
    setShowMapModal(true);
  };

  const ReducingVolunteersAccordingDistance = async (relevantRequestsArray) => {
    const API_KEY = MAPS_API_KEY;

    // Create a function to calculate the road distance between two locations
    const calculateDistance = async (
      originLat,
      originLng,
      destLat,
      destLng
    ) => {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${originLat},${originLng}&destinations=${destLat},${destLng}&key=${API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      return data.rows[0].elements[0].distance.value;
    };

    // Map the input array to a new array with the road distance added to each object
    const updatedArray = await Promise.all(
      relevantRequestsArray.map(async (request) => {
        const distance = await calculateDistance(
          request.requestLatitude,
          request.requestLongitude,
          request.volunteerLatitude,
          request.volunteerLongitude
        );
        return { ...request, distance };
      })
    );

    // Filter the updated array to only include objects with a distance less than or equal to 5 kilometers
    const filteredArray = updatedArray.filter(
      (request) => request.distance <= km * 1000
    );

    postVolunteerToVolunteerOfRequest(filteredArray);
  };

  const postVolunteerToVolunteerOfRequest = (filteredLocations) => {
    filteredLocations.forEach((element) => {
      axios
        .post(
          `InsertToVolunteerOfRequest/${user.Phone}/RequestId/${element.requestId}`
        )
        .then((res) => {})
        .catch((err) => {
          console.log(err.response.data);
        });
    });
    setLoading(false);
  };

  const getRelevantRequests = () => {
    return new Promise((resolve, reject) => {
      const apiGetRelevantRequests = `GetRelevantRequestsToVolunteer/${user.Phone}`;
      axios
        .get(apiGetRelevantRequests)
        .then((res) => {
          ReducingVolunteersAccordingDistance(res.data);
          resolve(res.data);
        })
        .catch((err) => {
          reject(err);
          alert(err.response.data);
        });
    });
  };
  //get relevant requests happend and brings all the relevant requests
  //than the array filtered by distance and added to the volunteer of request table
  //than axios.get(RequestApi + user.Phone) happens,brings the relevant requests from vof table and the request list is updated
  //when the request list is updated the loading is false and the page is rendered
  useFocusEffect(
    React.useCallback(() => {
      async function getRequestList() {
        try {
          setLoading(true);
          const [relevantRequests, requestListRes] = await Promise.all([
            getRelevantRequests(),
            axios.get(RequestApi + user.Phone),
          ]);
          const requestList = requestListRes.data.sort(
            (a, b) => b.requestId - a.requestId
          );
          setRequestList(requestList);
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      }
      getRequestList();
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
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              marginVertical: 20,
            }}
          >
            Available Requests
          </Text>
          <TouchableOpacity style={styles.buttonMap} onPress={handleShowMap}>
            <Text style={styles.buttonText}>Show Requests On Map</Text>
          </TouchableOpacity>

          {requestList.map((req, index) => (
            <RequestCardVolunteer
              key={index}
              requestIcon={req.specialtyIcon}
              requestType={req.specialtyName}
              requestDate={req.requestDate}
              requestLocation={req.requestAddress}
              requestStatus={req.requestStatus}
              requestId={req.requestId}
              citizenPushToken={req.citizenExpo_push_token}
              from="Available"
              cancelRequest={handleCancelRequest}
              acceptRequest={handleAcceptRequest}
              showDetails={handleShowModalDetails}
            />
          ))}
          <RequestDetailsModal
            showModalDetails={showModalDetails}
            selectedRequestDetails={selectedRequestDetails}
            setShowModalDetails={setShowModalDetails}
          />
          <WazeNavigationModal
            showModal={showModal}
            setShowModal={setShowModal}
            handleLaunchWaze={handleLaunchWaze}
            location={requestAddress}
          />
          <MapModal
            showMapModal={showMapModal}
            setShowMapModal={setShowMapModal}
            markers={markers}
            setSelectedRequestDetails={setSelectedRequestDetails}
            setShowModalDetails={setShowModalDetails}
            requestList={requestList}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  buttonMap: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
};

const styles1 = StyleSheet.create({
  label: {
    fontSize: 16,
    color: "black",
    marginBottom: 8,
  },

  // other styles
});
