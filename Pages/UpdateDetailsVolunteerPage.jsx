import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Input, Button, CheckBox } from "react-native-elements";
import Navbar from "../Components/Navbar";
import axios from "axios";
import LanguageCheckbox from "../Components/LanguageCheckbox";
import SpecialtyCheckbox from "../Components/SpecialtyCheckbox";
import ExpertGroupRadio from "../Components/ExpertGroupRadio";
import { MaterialIcons } from "@expo/vector-icons";
import { AuthContext } from "../Context/AuthProvider";
import UpdateInput from "../Components/UpdateInput";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { AvailableStatusContext } from "../Context/AvailableStatusProvider";

export default function UpdateDetailsVolunteerPage(props) {
  const { isAvailable } = React.useContext(AvailableStatusContext);
  const { user, setUser } = useContext(AuthContext);
  const [personType, setPersonType] = useState(user.PersonType);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState(user.Phone);
  const [language, setLanguage] = useState([]);
  const [checkedLanguage, setCheckedLanguage] = useState([]);
  const [specialty, setSpecialty] = useState([]);
  const [checkedSpecialty, setCheckedSpecialty] = useState([]);
  const [expertGroup, setExpertGroup] = useState([]);
  const [selectedExpertGroup, setSelectedExpertGroup] = useState(0);

  const apiVolunteer =
    "api/Volunteers";
  const apiLanguage =
    "api/Languages";
  const apiSpecialty =
    "api/Specialtys";
  const apiExpertGroup =
    "api/ExpertGroups";

  useFocusEffect(
    React.useCallback(() => {
      async function getTokenDetails() {
        setPhone(await AsyncStorage.getItem("Phone"));
        axios
          .get(apiVolunteer + `/${await AsyncStorage.getItem("Phone")}`)
          .then((res) => {
            setFirstName(res.data.fName);
            setLastName(res.data.lName);
            setEmail(res.data.email);
            setPhone(res.data.phone);
            setSelectedExpertGroup(res.data.expertId);
          })
          .catch((err) => {
            console.log(err);
          });
      }
      getTokenDetails();
    }, [])
  );
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
    axios
      .get(apiSpecialty)
      .then((res) => {
        setSpecialty(res.data);
        setCheckedSpecialty(Array(res.data.length).fill(false));
      })
      .catch((err) => {
        alert(err.response.data);
      });
    axios
      .get(apiExpertGroup)
      .then((res) => {
        setExpertGroup(res.data);
      })
      .catch((err) => {
        alert(err.response.data);
      });
  }, []);

  useEffect(() => {
    if (language.length > 0) {
      //make sure language array has content
      axios //get the spoken language from db
        .get(apiLanguage + `/${phone}`)
        .then((res) => {
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

  useEffect(() => {
    if (specialty.length > 0) {
      //make sure specialty array has content
      axios //get the volunteer specialty from db
        .get(apiSpecialty + `/${phone}`)
        .then((res) => {
          let tmp = [];
          for (let i = 0; i < specialty.length; i++) {
            const isSpecialtyBelongToVolunteer = res.data.some(
              (element) =>
                element.specialtyId === specialty[i].specialtyId &&
                element.specialtyName === specialty[i].specialtyName
            );
            if (isSpecialtyBelongToVolunteer)
              tmp.push(specialty[i].specialtyId);
          }
          setCheckedSpecialty(tmp);
        })
        .catch((err) => {
          alert(err.response.data);
        });
    }
  }, [specialty]);

  const handleUpdateDetails = () => {
    const res = vaildVolunteerDetails();
    if (res.status) {
      const volunteer = {
        Phone: phone,
        FName: firstName,
        LName: lastName,
        Password: password,
        Email: email,
        PersonType: "V",
        Expo_push_token: "",
        AvilabilityStatus: isAvailable,
        HoursAvailable: 0,
        MinsAvailable: 0,
        PressTime: new Date(),
        ExpertId: selectedExpertGroup,
        VolunteerAddress: "",
        VolunteerLongitude: 0,
        VolunteerLatitude: 0,
      };
      axios //update voluteer details
        .put(apiVolunteer, volunteer)
        .then((res) => {
          axios //delete voluteer languages
            .delete(apiLanguage + `/${phone}`)
            .then((res) => {
              for (let i = 0; i < checkedLanguage.length; i++) {
                //insert new languages
                if (checkedLanguage[i]) {
                  axios
                    .post(
                      `VolunteerPhone/${phone}/VolunteerLanguageId/${
                        i + 1
                      }`
                    )
                    .then((res) => {})
                    .catch((err) => {
                      console.log(err);
                    });
                }
              }

              axios //delete voluteer specialties
                .delete(apiSpecialty + `/${phone}`)
                .then((res) => {
                  for (let i = 0; i < checkedSpecialty.length; i++) {
                    //insert new specialties
                    axios
                      .post(
                        `VolunteerPhone/${phone}/VolunteerSpecialtyId/${checkedSpecialty[i]}`
                      )
                      .then((res) => {})
                      .catch((err) => {
                        console.log(err);
                      });
                  }
                })
                .catch((err) => {
                  alert(err.response.data);
                });
            })
            .catch((err) => {
              console.log(err);
            });
          alert("Details updated successfully");
          setUser(volunteer);
          setPassword("");
          setConfirmPassword("");
        })
        .catch((error) => {
          alert(err.response.data);
        });
    } else {
      alert(res.msg);
    }
  };

  const vaildVolunteerDetails = () => {
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
    if (checkedSpecialty.every((value) => value === false))
      return {
        status: false,
        msg: "you have to choose at least one specialty",
      };

    return { status: true };
  };

  const handleLanguageCheckPress = (index) => {
    let tmp = [...checkedLanguage];
    tmp[index - 1] = !tmp[index - 1];
    setCheckedLanguage(tmp);
  };
  const handleSpecialtyCheckPress = (index) => {
    const isChecked = checkedSpecialty.includes(index);
    if (isChecked) {
      setCheckedSpecialty(checkedSpecialty.filter((spc) => spc !== index));
    } else {
      setCheckedSpecialty([...checkedSpecialty, index]);
    }
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
                value={phone}
                onChangeText={setPhone}
                label="Phone"
                edit={false}
                keyboardType="number-pad"
                secureTextEntry={false}
              />
              <UpdateInput
                value={email}
                onChangeText={setEmail}
                label="Email"
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
              <Text style={styles.label}>Language</Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                {language.map((lng, index) => (
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
              <Text style={styles.label}>Specialty</Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                {specialty.map((spc, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      flexBasis: "30%",
                      margin: 5,
                    }}
                  >
                    <SpecialtyCheckbox
                      title={spc.specialtyName}
                      checked={checkedSpecialty.includes(spc.specialtyId)}
                      onPress={() => handleSpecialtyCheckPress(spc.specialtyId)}
                      checkedColor="green"
                    />
                  </View>
                ))}
              </View>
              <Text style={styles.label}>Expert Group</Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                {expertGroup.slice(1).map((exp) => (
                  <ExpertGroupRadio
                    key={exp.expertGroupId}
                    expertGroupId={exp.expertGroupId}
                    expertGroupName={exp.expertGroupName}
                    selectedExpertGroup={selectedExpertGroup}
                    onPress={() => setSelectedExpertGroup(exp.expertGroupId)}
                  />
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
  },
  signUpButton: {
    borderRadius: 50,
    padding: 10,
    margin: 10,
    backgroundColor: "#3DDC84",
  },
};
