import {
  View,
  Text,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  TouchableOpacity,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import { Button, Input } from "react-native-elements";
import axios from "axios";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../Context/AuthProvider";
import {registerForPushNotificationsAsync} from "../PushNotification/createPushToken";

const apiLogin = "login";
const apiUpdatePushNotificationToken = "UpdateUserPushNotificationToken/";

export default function LoginPage(props) {
  const { user, setUser } = useContext(AuthContext);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = React.useState("");

  const type = props.route.params?.type;

  const handleLogin = () => {
    const person = {
      Phone: phone,
      FName: "",
      LName: "",
      Password: password,
      Email: "",
      PersonType: type,
      Expo_push_token: ""
    };
    axios
      .post(apiLogin, person)
      .then((res) => {
        if (res.data?.message) {
          alert(res.data.message);
          return;
        }
        const { Token } = res.data;
        let obj = {
          Phone: phone,
          FName: res.data.FName,
          LName: res.data.LName,
          Email: res.data.Email,
          PersonType: res.data.PersonType,
          IsActive: res.data.IsActive,
        };
        setUser(obj);
        if (obj.PersonType != type) {
          if (type == "C")
            alert(`you are a volunteer, please login as volunteer`);
          else alert(`you are a citizen, please login as citizen`);
          return;
        } else {
          saveToken(Token, obj.PersonType, phone);
          createTokenForPushNotification()
          if (obj.PersonType == "C") {
            props.navigation.navigate("CitizenDrawer", {
              phone: phone,
            });
          } else {
            if (obj.IsActive == false) {
              alert("Your account is not active, please contact our team");
              return;
            }
            props.navigation.navigate("VolunteerDrawer", {
              phone: phone,
            });
          }
        }
      })
      .catch((err) => {
        alert(err.response.data?.message);
      });
  };

  const saveToken = async (token, type, phone) => {
    try {
      await AsyncStorage.setItem("Token", token);
      await AsyncStorage.setItem("Type", type);
      await AsyncStorage.setItem("Phone", phone);
    } catch (e) {
      console.log(e);
    }
  };

  const handleSignUp = () => {
    if (type == "C")
      props.navigation.navigate("RegistrationCitizenPage", { type: type });
    else props.navigation.navigate("RegistrationVolunteerPage", { type: type });
  };

  const createTokenForPushNotification = () => {
    registerForPushNotificationsAsync().then(token =>
      axios.put(apiUpdatePushNotificationToken + `${phone}/PushNotificationToken/${token}`)
        .then((res) => {

        }).catch((err) => {
          console.log(err);
        }));
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : null}
        keyboardVerticalOffset={Platform.OS === "android" ? 0 : 100}
        style={{ flex: 1 }}
      >
        <ScrollView>
          <View style={styles.container}>
            <Navbar type="Register" />
            <View style={styles.formContainer}>
              <Text style={styles.label}>Phone</Text>
              <Input
                value={phone}
                onChangeText={setPhone}
                keyboardType="number-pad"
              />
              <Text style={styles.label}>Password</Text>
              <Input
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <Button
                buttonStyle={styles.loginButton}
                onPress={handleLogin}
                title="Login"
              />
              <TouchableOpacity style={styles.link} onPress={handleSignUp}>
                <Text style={styles.linkText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = {
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    paddingBottom: 30,
  },
  formContainer: {
    width: "80%",
  },
  label: {
    fontSize: 16,
    paddingTop: 5,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 50,
  },
  loginButton: {
    borderRadius: 50,
    borderWidth: 2,
    padding: 10,
    margin: 10,
  },
  link: {
    marginTop: 10,
  },
  linkText: {
    color: "blue",
    textDecorationLine: "underline",
    textAlign: "center",
  },
};
