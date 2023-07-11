import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import { Input, Button, CheckBox } from "react-native-elements";
import Navbar from "../Components/Navbar";
import axios from "axios";
import LanguageCheckbox from "../Components/LanguageCheckbox";
import SpecialtyCheckbox from "../Components/SpecialtyCheckbox";
import ExpertGroupRadio from "../Components/ExpertGroupRadio";
import emailjs from "@emailjs/browser";
import { SERVICE_ID, TEMPLATE_ID_VOLUNTEER, USER_ID } from "@env";

export default function RegistrationVolunteerPage(props) {
  const [personType, setPersonType] = useState(props.route.params.type);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [language, setLanguage] = useState([]);
  const [checkedLanguage, setCheckedLanguage] = useState([]);
  const [specialty, setSpecialty] = useState([]);
  const [checkedSpecialty, setCheckedSpecialty] = useState([]);
  const [expertGroup, setExpertGroup] = useState([]);
  const [selectedExpertGroup, setSelectedExpertGroup] = useState(0);

  const apiVolunteer = "api/Volunteers";
  const apiLanguage = "api/Languages";
  const apiSpecialty = "api/Specialtys";
  const apiExpertGroup = "api/ExpertGroups";

  // useEffect(() => {
  //   const fetchLanguage = async () => {
  //     try {
  //       const response = await fetch(apiLanguage);
  //       const data = await response.json();
  //       setLanguage(data);
  //       setCheckedLanguage(Array(data.length).fill(false));
  //     } catch (error) {
  //       alert(error.response.data);
  //     }
  //   };
  //   const fetchSpecialty = async () => {
  //     try {
  //       const response = await fetch(apiSpecialty);
  //       const data = await response.json();
  //       setSpecialty(data);
  //       setCheckedSpecialty(Array(data.length).fill(false));
  //     } catch (error) {
  //       alert(error.response.data);
  //     }

  //   };
  //   const fetchExpertGroup = async () => {
  //     const response = await fetch(apiExpertGroup);
  //     const data = await response.json();
  //     setExpertGroup(data);
  //   };
  //   fetchLanguage();
  //   fetchSpecialty();
  //   fetchExpertGroup();
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

  function sendEmail() {
    const emailObject = {
      from_name: "Resc4You",
      to_name: `${firstName} ${lastName}`,
      to_email: email,
    };

    emailjs.send(SERVICE_ID, TEMPLATE_ID_VOLUNTEER, emailObject, USER_ID).then(
      (result) => {
        console.log(result.text);
      },
      (error) => {
        console.log(error.text);
      }
    );
  }

  const handleSignUp = () => {
    const res = vaildVolunteerDetails();
    if (res.status) {
      const volunteer = {
        Phone: phone,
        FName: firstName,
        LName: lastName,
        Password: password,
        Email: email,
        AvilabilityStatus: false,
        HoursAvailable: 0,
        MinsAvailable: 0,
        VolunteerAddress: "",
        VolunteerLongitude: 0,
        VolunteerLatitude: 0,
        PressTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        ExpertId: selectedExpertGroup,
        PersonType: personType,
        Expo_push_token: "",
      };
      axios
        .post(apiVolunteer, volunteer)
        .then((res) => {
          for (let i = 0; i < checkedLanguage.length; i++) {
            if (checkedLanguage[i]) {
              axios
                .post(`VolunteerPhone/${phone}/VolunteerLanguageId/${i + 1}`)
                .then((res) => {
                  setCheckedLanguage([]);
                })
                .catch((err) => {
                  console.log(err);
                });
            }
          }
          for (let i = 0; i < checkedSpecialty.length; i++) {
            if (checkedSpecialty[i]) {
              axios
                .post(`VolunteerPhone/${phone}/VolunteerSpecialtyId/${i + 1}`)
                .then((res) => {
                  setCheckedSpecialty([]);
                  alert("Registration completed successfully");
                  sendEmail();
                  props.navigation.navigate("LoginPage", {
                    type: "V",
                  });
                })
                .catch((err) => {
                  console.log(err);
                });
            }
          }
        })
        .catch((error) => {
          alert(error.response.data);
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
    let tmp = [...checkedSpecialty];
    tmp[index - 1] = !tmp[index - 1];
    setCheckedSpecialty(tmp);
  };
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
              <Text style={styles.label}>First Name</Text>
              <Input value={firstName} onChangeText={setFirstName} />
              <Text style={styles.label}>Last Name</Text>
              <Input value={lastName} onChangeText={setLastName} />
              <Text style={styles.label}>Email</Text>
              <Input
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
              <Text style={styles.label}>Password</Text>
              <Input
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <Text style={styles.label}>Confirm Password</Text>
              <Input
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              <Text style={styles.label}>Phone</Text>
              <Input
                value={phone}
                onChangeText={setPhone}
                keyboardType="number-pad"
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
                      checked={checkedSpecialty[spc.specialtyId - 1]}
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
                title="Sign Up"
                onPress={handleSignUp}
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
