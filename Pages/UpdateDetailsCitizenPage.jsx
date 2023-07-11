import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { Button } from "react-native-elements";
import Navbar from "../Components/Navbar";
import { useFocusEffect } from "@react-navigation/native";

import axios from "axios";
import LanguageCheckbox from "../Components/LanguageCheckbox";
import { AuthContext } from "../Context/AuthProvider";
import UpdateInput from "../Components/UpdateInput";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function UpdateDetailsCitizenPage(props) {
  const { user, setUser } = useContext(AuthContext);
  const [personType, setPersonType] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [language, setLanguage] = useState([]);
  const [checkedLanguage, setCheckedLanguage] = useState([]);

  const apiCitizen = "api/Citizens";
  const apiLanguage = "api/Languages";

  // useEffect(() => {
  //   const fetchLanguage = async () => {
  //     try {
  //       const response = await fetch(apiLanguage);
  //       const data = await response.json();
  //       console.log(data);
  //       setLanguage(data);
  //       setCheckedLanguage(Array(data.length).fill(false));
  //     } catch (error) {
  //       alert(error.response.data);
  //     }
  //   };
  //   fetchLanguage();
  // }, []);

  useEffect(() => {
    axios
      .get(apiLanguage)
      .then((res) => {
        setLanguage(res.data);
        setCheckedLanguage(Array(res.data.length).fill(false));
      })
      .catch((err) => {
        alert(err.response.data);
      });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      async function getTokenDetails() {
        try {
          axios
            .get(apiCitizen + `/${await AsyncStorage.getItem("Phone")}`)
            .then((res) => {
              setFirstName(res.data.fName);
              setLastName(res.data.lName);
              setEmail(res.data.email);
              setPhone(res.data.phone);
            })
            .catch((err) => {
              console.log(err);
            });
        } catch (error) {
          console.log(error);
        }
      }
      getTokenDetails();
    }, [])
  );

  useEffect(() => {
    if (language.length > 0) {
      //make sure language array has content
      axios //get the spoken language from db
        .get(apiLanguage + `/${phone}`)
        .then((res) => {
          console.log(res.data);
          let tmp = [];
          for (let i = 0; i < language.length; i++) {
            const isLanguageBelongToVolunteer = res.data.some(
              (element) =>
                element.languageId === language[i].languageId &&
                element.languageName === language[i].languageName
            );
            if (isLanguageBelongToVolunteer) tmp.push(true);
            else tmp.push(false);
          }
          setCheckedLanguage(tmp);
        })
        .catch((err) => {
          alert(err.response.data);
        });
    }
  }, [language]);

  const handleUpdateDetails = () => {
    const res = vaildCitizenDetails();
    if (res.status) {
      const citizen = {
        Phone: phone,
        FName: firstName,
        LName: lastName,
        Password: password,
        Email: email,
        PersonType: personType,
        Expo_push_token: "",
      };
      axios //update citizen details
        .put(apiCitizen, citizen)
        .then((res) => {
          axios //delete citizen languages
            .delete(apiLanguage + `/${phone}`)
            .then((res) => {
              for (let i = 0; i < checkedLanguage.length; i++) {
                //insert new languages
                if (checkedLanguage[i]) {
                  axios
                    .post(`CitizenPhone/${phone}/CitizenLanguageId/${i + 1}`)
                    .then((res) => {})
                    .catch((err) => {
                      alert(err.response.data);
                    });
                }
              }
            })
            .catch((err) => {
              alert(err.response.data);
            });
          setUser(citizen);
          alert("Details updated successfully");
          setConfirmPassword("");
          setPassword("");
        })
        .catch((err) => {
          alert(err.response.data);
          console.log(err);
        });
    } else {
      alert(res.msg);
    }
  };

  const vaildCitizenDetails = () => {
    const validPhone = /^[0-9]{10}$/;
    const validEmail = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;
    if (firstName == "")
      return { status: false, msg: "you must enter first name" };
    if (lastName == "")
      return { status: false, msg: "you must enter last name" };
    if (password == "")
      return { status: false, msg: "you must enter password" };
    if (confirmPassword == "")
      return { status: false, msg: "you must enter confirm password" };
    if (password !== confirmPassword)
      return { status: false, msg: "password doesnt match" };
    if (!validPhone.test(phone))
      return { status: false, msg: "phone should contain 10 digits" };
    if (!validEmail.test(email))
      return { status: false, msg: "incorrect email" };
    if (checkedLanguage.every((value) => value === false))
      return { status: false, msg: "you have to choose at least one language" };

    return { status: true };
  };

  const handleLanguageCheckPress = (index) => {
    let tmp = [...checkedLanguage];
    tmp[index - 1] = !tmp[index - 1];
    setCheckedLanguage(tmp);
  };
  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : null}
        keyboardVerticalOffset={Platform.OS === "android" ? 0 : 100}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <Navbar type="Register" />
            <View style={styles.formContainer}>
              <UpdateInput
                value={firstName}
                onChangeText={setFirstName}
                label="First Name"
                edit={true}
                secureTextEntry={false}
              />
              <UpdateInput
                value={lastName}
                onChangeText={setLastName}
                label="Last Name"
                edit={true}
                secureTextEntry={false}
              />
              <UpdateInput
                value={password}
                onChangeText={setPassword}
                label="Password"
                edit={true}
                secureTextEntry={true}
              />
              <UpdateInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                label="Confirm Password"
                edit={true}
                secureTextEntry={true}
              />
              <UpdateInput
                value={email}
                onChangeText={setEmail}
                label="Email"
                edit={true}
                secureTextEntry={false}
              />
              <UpdateInput
                value={phone}
                onChangeText={setPhone}
                label="Phone"
                edit={false}
                keyboardType="number-pad"
                secureTextEntry={false}
              />
              <Text style={styles.label}>Language</Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                {checkedLanguage.length > 0 &&
                  language.map((lng, index) => (
                    <View
                      key={index}
                      style={{
                        flexDirection: "row",
                        flexBasis: "30%",
                        margin: 5,
                      }}
                    >
                      <LanguageCheckbox
                        title={lng.languageName}
                        checked={checkedLanguage[lng.languageId - 1]}
                        onPress={() => handleLanguageCheckPress(lng.languageId)}
                        checkedColor="green"
                      />
                    </View>
                  ))}
              </View>

              <Button
                buttonStyle={styles.signUpButton}
                title="Update Details"
                onPress={handleUpdateDetails}
              />
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
  formContainer: {
    width: "80%",
  },
  label: {
    fontSize: 16,
    paddingTop: 5,
    paddingBottom: 5,
  },
  signUpButton: {
    borderRadius: 50,
    padding: 10,
    margin: 10,
    backgroundColor: "#3DDC84",
  },
};
