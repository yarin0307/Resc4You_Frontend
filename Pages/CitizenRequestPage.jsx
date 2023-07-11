import React, { useEffect, useState, useRef } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView } from "react-native";
import MainNavbar from "../Components/MainNavbar";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { RequestCounterContext } from "../Context/RequestCounterProvider";
import RequestCardCitizen from "../Components/RequestCardCitizen";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, remove } from "firebase/database";
import firebaseConfig from "../firebaseConfig";
import { AuthContext } from "../Context/AuthProvider";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { sendPushNotification } from "../PushNotification/sendPushNotification";
import LoadingSpinner from "../Components/LoadingSpinner";
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function CitizenRequestPage(props) {
  const [requestList, setRequestList] = useState([]);
  const [notification, setNotification] = useState(false);
  const [loading, setLoading] = useState(true);

  const RequestApi = "phone/";
  const CitizenApi =
    "api/Citizens/";
  const { requestCounter, setRequestCounter } = React.useContext(
    RequestCounterContext
  );
  const { user } = React.useContext(AuthContext);

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

  // useFocusEffect(
  //   React.useCallback(() => {
  //     async function getTokenDetails() {
  //       try {
  //         const res = await axios.get(RequestApi + user.Phone);
  //         setRequestList(res.data.sort((a, b) => b.requestId - a.requestId));
  //         setLoading(false);
  //       } catch (error) {
  //         alert(error.response.data);
  //       }
  //     }
  //     getTokenDetails();
  //   }, [])
  // );
  useFocusEffect(
    React.useCallback(() => {
      axios
        .get(RequestApi + user.Phone)
        .then((res) => {
          setRequestList(res.data.sort((a, b) => b.requestId - a.requestId));
          setLoading(false);
        })
        .catch((error) => {
          alert(error.response.data);
        });
        return () => {
          setLoading(true);
        }
    }, [])
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  const app = initializeApp(firebaseConfig);
  function DeleteRequestInFireBase(requestId) {
    //delete request from firebase
    const db = getDatabase(app);
    const r = remove(ref(db, "Requests/" + requestId));
    console.log(r);
  }

  const handleCancelRequest = (requestId, requestStatus) => {
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
            if (requestStatus === "In Progress") {
              const GetVolunteerHandlePushTokkenApi = `GetVolunteerHandlePushTokken/`;
              const message = {
                title: "Request was canceled",
                body: `we are sorry, ${user.FName} ${user.LName} canceled his request`,
                screen: "Volunteer Availablity Status",
              };
              axios
                .get(GetVolunteerHandlePushTokkenApi + `${requestId}`)
                .then((res) => {
                  sendPushNotification(res.data, message);
                  axios
                    .delete(CitizenApi + `${requestId}`)
                    .then((res) => {
                      setRequestList(
                        requestList.filter((req) => req.requestId !== requestId)
                      );
                      DeleteRequestInFireBase(requestId);
                      setRequestCounter(0);
                    })
                    .catch((err) => {
                      alert(err.response.data);
                    });
                })
                .catch((err) => {
                  console.log(err);
                });
            } else {
              console.log("requestId", requestId);
              axios
                .delete(CitizenApi + `${requestId}`)
                .then((res) => {
                  setRequestList(
                    requestList.filter((req) => req.requestId !== requestId)
                  );
                  DeleteRequestInFireBase(requestId);
                  setRequestCounter(0);
                })
                .catch((err) => {
                  alert(err.response.data);
                });
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

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
            My Requests
          </Text>
          {requestList.map((req, index) => (
            <RequestCardCitizen
              key={index}
              requestIcon={req.specialtyIcon}
              requestType={req.specialtyName}
              requestDate={req.requestDate}
              requestLocation={req.requestAddress}
              requestStatus={req.requestStatus}
              requestId={req.requestId}
              cancelRequest={handleCancelRequest}
              isReviewed={req.isRevewed}
              volunteerHandle={req.volunteerHandle}
            />
          ))}
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
};
