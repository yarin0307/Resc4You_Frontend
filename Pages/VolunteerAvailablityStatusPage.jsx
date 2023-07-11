import React, { useState, useContext, useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";
import { AvailableStatusContext } from "../Context/AvailableStatusProvider";
import { AuthContext } from "../Context/AuthProvider";
import * as Notifications from "expo-notifications";
import { MAPS_API_KEY } from "@env";
import { Button } from "react-native-elements";
import { KMContext } from "../Context/KMProvider";
import { set } from "firebase/database";

const GetStatusApi = "api/Volunteers/";
const VolunteerAvailablityStatusPage = (props) => {
  const { isAvailable, setIsAvailable } = React.useContext(
    AvailableStatusContext
  );
  const { km, setKm } = React.useContext(KMContext);

  const buttonColor = isAvailable ? "red" : "green";
  const buttonText = isAvailable ? "Not available" : "Available";
  const [TextAvilable, setTextAvilable] = useState("available");
  const [hours, setHours] = useState(0);
  const [notification, setNotification] = useState(false);
  const [minutes, setMinutes] = useState(0);
  // const [phone, setPhone] = useState(props.route.params?.phone);
  const { user, setUser } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false); // add isLoading state variable

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

  useFocusEffect(
    React.useCallback(() => {
      if (user && user.Phone) {
        axios
          .get(GetStatusApi + `${user.Phone}`)
          .then((res) => {
            setIsAvailable(res.data.avilabilityStatus);
            setTextAvilable(
              res.data.avilabilityStatus ? "unavailable" : "available"
            );
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }, [user])
  );
  const handlePress = () => {
    if (hours === 0 && minutes === 0 && !isAvailable) {
      alert("Please enter the time you are available for");
      return;
    }
    setIsLoading(true);

    if (!isAvailable) {
      const getLocation = async () => {
        const controller = new AbortController();
        const signal = controller.signal;

        const timeoutId = setTimeout(() => {
          controller.abort();
        }, 30000);

        let { status } = await Location.requestForegroundPermissionsAsync({
          signal,
        });
        if (status !== "granted") {
          clearTimeout(timeoutId);
          return;
        }

        let location = await Location.getCurrentPositionAsync({ signal });

        // Reverse geocode the current location to get the address
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.coords.latitude}&lon=${location.coords.longitude}`,
          { signal }
        );
        const data = await response.json();

        const houseNumber = data.address.house_number
          ? `, ${data.address.house_number}`
          : "";
        const address = `${data.address.road}${houseNumber}, ${data.address.city}, ${data.address.country}`;

        const apiUpdateStatus = `minutes/${minutes}/hours/${hours}/phone/${
          user.Phone
        }/avilabilityStatus/${!isAvailable}/address/${address}/longitude/${
          location.coords.longitude
        }/latitude/${location.coords.latitude}`;
        axios
          .put(apiUpdateStatus)
          .then((res) => {
            setHours(0);
            setMinutes(0);
            getRelevantRequests();
            setIsAvailable(!isAvailable);
            setTextAvilable(isAvailable ? "available" : "unavailable");
          })
          .catch((err) => {
            alert("Something went wrong");
            setIsLoading(false);
          })
          .finally(() => {
            clearTimeout(timeoutId);
          });
      };

      getLocation().catch((err) => {
        setIsAvailable(false);
        if (err.name === "AbortError") {
          alert("Location request timed out");
        } else {
          alert("Please turn on your location");
        }
        setIsLoading(false);
      });
    } else {
      const apiUpdateStatus = `minutes/${minutes}/hours/${hours}/phone/${
        user.Phone
      }/avilabilityStatus/${!isAvailable}/address/""/longitude/0/latitude/0`;
      setIsLoading(true);
      axios
        .put(apiUpdateStatus)
        .then((res) => {
          setHours(0);
          setMinutes(0);
          setIsAvailable(!isAvailable);
          setTextAvilable(isAvailable ? "available" : "unavailable");
          setIsLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setIsLoading(false);
        });
    }
  };

  const getRelevantRequests = () => {
    const apiGetRelevantRequests = `GetRelevantRequestsToVolunteer/${user.Phone}`;
    axios
      .get(apiGetRelevantRequests)
      .then((res) => {
        ReducingVolunteersAccordingDistance(res.data);

        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
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
          console.log(err);
        });
    });
  };

  const handleMinChange = (text) => {
    if (/^([1-9]|[1-5][0-9])$/.test(text) || text === "") {
      setMinutes(text);
    }
  };
  const handleHoursChange = (text) => {
    if (/^[1-8]$/.test(text) || text === "") {
      setHours(text);
    }
  };

  const handleUpdateLocation = () => {
    setIsLoading(true);
    const getLocation = async () => {
      const controller = new AbortController();
      const signal = controller.signal;

      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 30000);

      let { status } = await Location.requestForegroundPermissionsAsync({
        signal,
      });
      if (status !== "granted") {
        clearTimeout(timeoutId);
        return;
      }

      let location = await Location.getCurrentPositionAsync({ signal });

      // Reverse geocode the current location to get the address
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.coords.latitude}&lon=${location.coords.longitude}`,
        { signal }
      );
      const data = await response.json();

      const houseNumber = data.address.house_number
        ? `, ${data.address.house_number}`
        : "";
      const address = `${data.address.road}${houseNumber}, ${data.address.city}, ${data.address.country}`;

      const apiUpdateLocation = `UpdateLocation/${user.Phone}/address/${address}/longitude/${location.coords.longitude}/latitude/${location.coords.latitude}`;
      axios
        .put(apiUpdateLocation)
        .then((res) => {
          getRelevantRequests();
          setIsLoading(false);
          setIsAvailable(true);
        })
        .catch((err) => {
          alert("Something went wrong");
          setIsLoading(false);
        })
        .finally(() => {
          clearTimeout(timeoutId);
        });
    };

    getLocation().catch((err) => {
      setIsAvailable(false);
      if (err.name === "AbortError") {
        alert("Location request timed out");
      } else {
        alert("Please turn on your location");
      }
      setIsLoading(false);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Press to be {TextAvilable}</Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: buttonColor }]}
        onPress={handlePress}
        // disabled={!isAvailable && (hours === 0 || minutes === 0)}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.buttonText}>{buttonText}</Text>
        )}
        {isLoading && !isAvailable && (
          <View style={styles.loading}>
            <Text style={styles.loadingText}>Fetching location...</Text>
          </View>
        )}
      </TouchableOpacity>

      {!isAvailable && (
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Hours"
            value={hours}
            onChangeText={handleHoursChange}
            keyboardType="numeric"
          />
          <Text style={styles.delimiter}>:</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Minutes"
            value={minutes}
            onChangeText={handleMinChange}
            keyboardType="numeric"
          />
        </View>
      )}
      <TouchableOpacity
        style={styles.buttonUpdateLocation}
        onPress={handleUpdateLocation}
      >
        <Text style={styles.buttonUpdateLocationText}>Update Location</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white",
  },
  button: {
    width: 250,
    height: 250,
    borderRadius: 125,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 30,
    color: "white",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    paddingTop: 50,
    paddingBottom: 30,
  },
  textInputContainer: {
    marginTop: 20,
    flexDirection: "row",
  },
  textInput: {
    textAlign: "center",
    width: 100,
    height: 40,
    borderColor: "#6e6e6e",
    borderWidth: 1,
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#f5f5f5",
    color: "#333333",
    fontSize: 16,
  },
  delimiter: {
    textAlign: "center",
    marginVertical: 15,
    fontSize: 20,
    fontWeight: "bold",
  },
  loadingText: {
    color: "white",
    fontSize: 20,
  },
  buttonUpdateLocation: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    marginRight: 20,
    alignSelf: "flex-end",
  },
  buttonUpdateLocationText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default VolunteerAvailablityStatusPage;
