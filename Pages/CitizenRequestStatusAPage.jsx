import ProgressBar from "../Components/ProgressBar";
import {
  View,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useContext, useState, useEffect } from "react";
import MainNavbar from "../Components/MainNavbar";
import { Card, Text } from "react-native-elements";
import axios from "axios";
import { AuthContext } from "../Context/AuthProvider";
import { useFocusEffect } from "@react-navigation/native";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, off } from "firebase/database";
import firebaseConfig from "../firebaseConfig";
import { RequestCounterContext } from "../Context/RequestCounterProvider";

const labels = ["Reported", "On The Way", "Problem Solved"];
const apiDetailsOfReportedRequest =
  "GetDetailsOfReportedRequest/";
const apiGetOpenRequestCitizen =
  "GetCitizenOpenRequest/";
export default function CitizenRequestStatusAPage(props) {
  const [currentPosition, setCurrentPosition] = useState(0);
  const [NumOfVolunteer, setNumOfVolunteer] = useState(0);
  const [RequestDate, setRequestDate] = useState("");
  const { user, setUser } = useContext(AuthContext);
  const { requestCounter, setRequestCounter } = React.useContext(
    RequestCounterContext
  );

  var requestRef;
  const app = initializeApp(firebaseConfig);
  function listenToRequestStatus(requestId) {
    console.log("listen to request status");
    const db = getDatabase(app);
    requestRef = ref(db, "Requests/" + requestId);
    onValue(requestRef, (snapshot) => {
      const request = snapshot.val();
      console.log(request);
      if (request.Status === "In Progress") {
        props.navigation.navigate("CitizenRequestStatusBPage", {
          requestId: requestId,
        });
      } else if (request.Status === "Closed") {
        props.navigation.navigate("CitizenRequestStatusCPage", {
          requestId: requestId,
        });
      }
    });
  }
  useFocusEffect(
    React.useCallback(() => {
      axios.get(apiGetOpenRequestCitizen + user.Phone)
        .then((res) => {
          if (res.data.length === 0) {
            console.log(res.data, "no open request");
            setRequestCounter(0);
          } else {
            console.log("hereeeee");
            listenToRequestStatus(res.data[0].requestId);
            axios
              .get(apiDetailsOfReportedRequest + user.Phone)
              .then((res) => {
                setNumOfVolunteer(res.data[0].numOfRelevantVolunteer);
                let formattedDate;
                if (Platform.OS === "ios") {
                  formattedDate = new Intl.DateTimeFormat("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(res.data[0].requestDate));
                } else {
                  formattedDate = new Intl.DateTimeFormat("he-IL", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "UTC", // specify UTC time zone
                    hour12: false,
                  }).format(new Date(res.data[0].requestDate));
                }
                setRequestDate(formattedDate);
              })
              .catch((err) => {
                alert(err.response.data);
              });
          }
        })
        .catch((err) => {
          alert(err.response.data);
        });
      return () => {
        if (requestRef) off(requestRef);
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
          <View>
            <ProgressBar
              currentPosition={currentPosition}
              labels={labels}
              stepCount={labels.length}
            />
            <View style={styles.container}>
              <Card containerStyle={styles.card}>
                <Text style={styles.date}>
                  Request received on {RequestDate}
                </Text>
                <Text style={styles.message}>
                  Your request has been distributed to {NumOfVolunteer} relevant
                  volunteers in your area
                </Text>
                <Text style={styles.message}>
                  We will notify you when a volunteer is on their way.
                </Text>
              </Card>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    marginTop: 60,
  },
  card: {
    padding: 20,
    borderRadius: 20,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 2, height: 2 },
    elevation: 5,
  },
  date: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
});
