import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
} from "react-native";
import React, { useEffect, useContext } from "react";
import { ThemeProvider, Card } from "react-native-elements";
import Navbar from "../Components/Navbar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { registerForPushNotificationsAsync } from "../PushNotification/createPushToken";
import { AuthContext } from "../Context/AuthProvider";
import { KMContext } from "../Context/KMProvider";

const apiUpdatePushNotificationToken = "UpdateUserPushNotificationToken/";
const apiGetUser = "GetUserDetails/";

const apiKm = "api/KMs";

export default function HomePage(props) {
  const { user, setUser } = useContext(AuthContext);
  const { km, setKm } = useContext(KMContext);

  useEffect(() => {
    axios
      .get(apiKm)
      .then((response) => {
        setKm(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("Token");
        const type = await AsyncStorage.getItem("Type");
        const phone = await AsyncStorage.getItem("Phone");
        if (token !== null) {
          createTokenForPushNotification(phone);
          axios
            .get(apiGetUser + phone)
            .then((res) => {
              let obj = {
                Phone: res.data[0].phone,
                FName: res.data[0].fName,
                LName: res.data[0].lName,
                Email: res.data[0].email,
                PersonType: res.data[0].personType,
                IsActive: res.data[0].isActive,
              };
              setUser(obj);
              if (type == "C")
                props.navigation.navigate("CitizenDrawer", {
                  phone: phone,
                });
              else {
                if (obj.IsActive == true)
                  props.navigation.navigate("VolunteerDrawer", {
                    phone: phone,
                  });
              }
            })
            .catch((err) => {
              alert(err.response.data);
            });
        }
      } catch (e) {
        console.log(e);
      }
    };
    checkToken();
  }, []);

  const createTokenForPushNotification = (phone) => {
    registerForPushNotificationsAsync()
      .then((token) =>
        axios
          .put(
            apiUpdatePushNotificationToken +
              `${phone}/PushNotificationToken/${token}`
          )
          .then((res) => {})
          .catch((err) => {
            console.log(err);
          })
      )
      .catch((err) => {
        alert("Error in creating push notification token");
      });
  };

  return (
    <ThemeProvider>
      <ImageBackground
        source={{ uri: "https://wallpapercave.com/wp/wp6432037.jpg" }}
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View style={{ width: "70%" }}>
          <Navbar type="Home" />
          <View style={styles.usersContainer}>
            <TouchableOpacity
              style={{ width: "100%" }}
              onPress={() =>
                props.navigation.navigate("LoginPage", {
                  type: "C",
                })
              }
            >
              <Card containerStyle={styles.userCard}>
                <View style={styles.userContainer}>
                  <Text style={styles.userText}>Citizen</Text>
                </View>
              </Card>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ width: "100%" }}
              onPress={() =>
                props.navigation.navigate("LoginPage", {
                  type: "V",
                })
              }
            >
              <Card containerStyle={styles.userCard}>
                <View style={styles.userContainer}>
                  <Text style={styles.userText}>Volunteer</Text>
                </View>
              </Card>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </ThemeProvider>
  );
}
const styles = StyleSheet.create({
  headline: {
    fontSize: 40,
    marginTop: -50,
    marginBottom: 50,
    textAlign: "center",
  },

  usersContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  userCard: {
    width: "90%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 20,
    backgroundColor: "#03A9F4",
  },
  userContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  userText: {
    fontSize: 30,
    color: "white",
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 50,
  },
});
