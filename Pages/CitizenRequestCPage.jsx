import ProgressBar from "../Components/ProgressBar";
import {
  View,
  Text,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  TouchableOpacity,
  TextInput,
  Button,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import MainNavbar from "../Components/MainNavbar";
import { SelectList } from "react-native-dropdown-select-list";
import { Input } from "react-native-elements";
import { AuthContext } from "../Context/AuthProvider";
import { RequestCounterContext } from "../Context/RequestCounterProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import { sendPushNotification } from "../PushNotification/sendPushNotification";
import * as Notifications from "expo-notifications";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";
import firebaseConfig from "../firebaseConfig";
import { MAPS_API_KEY } from "@env";
import { KMContext } from "../Context/KMProvider";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const labels = ["Problem", "Location", "Details"];

const ManfacturerApi =
  "api/Manufacturers";

const RequestApi = "api/Requests";

export default function CitizenRequestCPage(props) {
  const { user } = React.useContext(AuthContext);
  const { km, setKm } = React.useContext(KMContext);
  const validLicenseNum = /^[0-9]{7,8}$/;
  const [currentPosition, setCurrentPosition] = useState(2);
  const [selected, setSelected] = React.useState("");
  const [ManfacturerArr, setManfacturerArr] = useState([]);
  const [submited, setSubmited] = useState(false);
  const [licenseNum, setLicenseNum] = useState("");
  const [notification, setNotification] = useState(false);
  const [key, setKey] = useState(Date.now()); // add a key state to reset the SelectList
  const { requestCounter, setRequestCounter } = React.useContext(
    RequestCounterContext
  );

  const app = initializeApp(firebaseConfig);
  function storeRequestInFireBase(requestId, status) {
    const db = getDatabase(app);
    const reference = ref(db, "Requests/" + requestId);
    set(reference, {
      status: status,
      phone: "",
    });
  }
  const notificationListener = useRef();
  const responseListener = useRef();
  useFocusEffect(
    React.useCallback(() => {
      setSubmited(false);
    }, [])
  );

  useEffect(() => {
    setSubmited(false);
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

  const handleRequest = () => {
    if (props.route.params.problemType !== 5) {
      if (selected === "" || licenseNum === "") {
        alert("Please fill all the fields");
        return;
      }
      if (!validLicenseNum.test(licenseNum)) {
        alert("Please enter a valid licence number");
        return;
      }
    }
    let manufacturerId = ManfacturerArr.find((item) => {
      if (item.value === selected) {
        return item;
      }
    });

    async function getTokenDetails() {
      try {
        const request = {
          RequestId: 0,
          RequestAddress: props.route.params.problemAddress,
          RequestLongitude: props.route.params.problemLongitude,
          RequestLatitude: props.route.params.problemLatitude,
          LicenseNum: licenseNum,
          RequestStatus: "Waiting",
          RequestDate: new Date(Date.now() + 3 * 60 * 60 * 1000),
          RequestSummary: "",
          CitizenPhone: await AsyncStorage.getItem("Phone"),
          WorkerPhone: "0500000000",
          ManufacturerId: manufacturerId ? manufacturerId.key : 1,
          SpecialtyId: props.route.params.problemType,
        };
        axios
          .post(RequestApi, request)
          .then((res) => {
            setSubmited(true);
            setRequestCounter(1);
            alert("Request submited successfully");
            let requestId = res.data;
            storeRequestInFireBase(requestId, request.RequestStatus);
            getRelevantVolunteers(props.route.params.problemType, requestId);
          })
          .catch((err) => {
            alert(err.response.data);
          });
      } catch (error) {
        console.log(error);
      }
    }
    getTokenDetails();
  };

  useFocusEffect(
    React.useCallback(() => {
      setLicenseNum("");
      setKey(Date.now());
      setSelected("");
      axios
        .get(ManfacturerApi)
        .then((res) => {
          let Manfacturer = [];
          for (let i = 0; i < res.data.length; i++) {
            Manfacturer.push({
              key: res.data[i].manufacturerId,
              value: res.data[i].manufacturerName,
            });
            setManfacturerArr(Manfacturer);
          }
        })
        .catch((err) => {
          alert(err.response.data);
        });
    }, [])
  );
  //find the relevant volunteers according to specialty
  const getRelevantVolunteers = (requestType, requestId) => {
    const getRelevantVolunteersApi = `GetRelevantVolunteer/${requestType}`;
    axios
      .get(getRelevantVolunteersApi)
      .then((res) => {
        ReducingVolunteersAccordingDistance(res.data, requestId);
      })
      .catch((err) => {
        alert(err.response.data);
      });
  };

  //filter the relevant volunteers according to their distance from the request
  const ReducingVolunteersAccordingDistance = (
    relevantVolunteerArray,
    requestId
  ) => {
    const API_KEY = MAPS_API_KEY;
    const requestLocation = {
      latitude: props.route.params.problemLatitude,
      longitude: props.route.params.problemLongitude,
    };

    const apiUrl = (origin, destination) =>
      `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.volunteerLatitude},${destination.volunteerLongitude}&key=${API_KEY}`;

    Promise.all(
      relevantVolunteerArray.map((location) =>
        fetch(apiUrl(requestLocation, location)).then((response) =>
          response.json()
        )
      )
    )
      .then((data) => {
        const filteredLocations = relevantVolunteerArray.filter((_, index) => {
          const route = data[index].routes[0];
          const distance =
            route.legs.reduce((total, leg) => total + leg.distance.value, 0) /
            1000;
          return distance <= km;
        });
        postVolunteerToVolunteerOfRequest(filteredLocations, requestId);
      })
      .catch((error) => console.error(error));
  };
  //post the relevant volunteers according to specialty and location to volunteer of request table
  const postVolunteerToVolunteerOfRequest = (filteredLocations, requestId) => {
    filteredLocations.forEach((element) => {
      axios
        .post(
          `InsertToVolunteerOfRequest/${element.volunteerPhone}/RequestId/${requestId}`
        )
        .then(async (res) => {
          const message = {
            title: "New Request",
            body: `A new request has been received at ${props.route.params.problemAddress}. We will be happy to assist`,
            screen: "Available Requests"
          };
          await sendPushNotification(element.expo_push_token, message);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : null}
        keyboardVerticalOffset={Platform.OS === "android" ? 0 : 100}
        style={{ flex: 1, backgroundColor: "white" }}
      >
        <MainNavbar />

        <ScrollView showsVerticalScrollIndicator={false}>
          <View>
            <ProgressBar
              currentPosition={currentPosition}
              labels={labels}
              stepCount={labels.length}
            />
            {props.route.params.problemType !== 5 && (
              <View style={styles.licenseNumContainer}>
                <Text style={styles.LicenseLabel}>License num:</Text>
                <Input
                  containerStyle={styles.licenseNumInputContainer}
                  inputContainerStyle={styles.licenseNumInput}
                  value={licenseNum}
                  onChangeText={(text) => setLicenseNum(text)}
                  keyboardType="numeric"
                />
              </View>
            )}
            <View>
              {props.route.params.problemType !== 5 && (
                <View style={styles.inputContainer}>
                  <View style={styles.selectContainer}>
                    <Text style={styles.carLabel}>Select car:</Text>
                    <View style={{ height: 50, width: "51%" }}>
                      <SelectList
                        data={ManfacturerArr}
                        setSelected={(item) => setSelected(item)}
                        placeholder="Select Manfacturer"
                        style={{ width: "100%" }}
                        save="value"
                        key={key}
                      />
                    </View>
                  </View>
                </View>
              )}
              <View style={styles.buttonContainer}>
                {!submited && (
                  <TouchableOpacity
                    onPress={handleRequest}
                    style={styles.button}
                  >
                    <Text style={styles.buttonText}>Request for Help</Text>
                  </TouchableOpacity>
                )}
                {submited && (
                  <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Show Request Status</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={[styles.button1, { backgroundColor: "red" }]}
              onPress={() =>
                props.navigation.navigate("CitizenRequestBPage", {
                  problemType: props.route.params.problemType,
                })
              }
            >
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
            {/* <Button title="Click me" onPress={() => storeHighScore(2, 200)} /> */}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = {
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    marginTop: 70,
  },
  button1: {
    backgroundColor: "green",
    padding: 12,
    borderRadius: 8,
    width: "20%",
    marginTop: 150,
    marginLeft: 5,
  },
  button: {
    backgroundColor: "green",
    padding: 12,
    borderRadius: 8,
    width: "50%",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  selectContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  carLabel: {
    fontWeight: "bold",
    marginRight: 37,
  },
  LicenseLabel: {
    fontWeight: "bold",
    marginRight: 20,
  },
  licenseNumContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  licenseNumInputContainer: {
    borderWidth: 1,
    borderColor: "grey",
    borderRadius: 8,
    width: "50%",
    height: "55%",
  },
  licenseNumInput: {
    borderBottomWidth: 0,
  },
};
