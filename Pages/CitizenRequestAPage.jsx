import ProgressBar from "../Components/ProgressBar";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  View,
  Text,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import MainNavbar from "../Components/MainNavbar";
import { Card } from "react-native-elements";
import { AuthContext } from "../Context/AuthProvider";
import { useFocusEffect } from "@react-navigation/native";
import SpecialtyCard from "../Components/SpecialtyCard";
import axios from "axios";

const labels = ["Problem", "Location", "Details"];

export default function CitizenRequestAPage(props) {
  const [currentPosition, setCurrentPosition] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [specialty, setSpecialty] = useState([]);
  const apiSpecialty = "api/Specialtys";

  const handleProblemSelect = (key) => {
    setSelectedOption(key);
  };
  const handleNext = () => {
    if (selectedOption) {
      props.navigation.navigate("CitizenRequestBPage", {
        problemType: selectedOption,
      });
      setSelectedOption(null);
    } else {
      alert("Please select a problem type");
    }
  };
  // useEffect(() => {
  //   const fetchSpecialty = async () => {
  //     const response = await fetch(apiSpecialty);
  //     const data = await response.json();
  //     const specialtyActive = data.filter((item) => item.isActive === true);
  //     setSpecialty(specialtyActive);
  //   };
  //   fetchSpecialty();
  // }, []);

  useEffect(() => {
    axios
      .get(apiSpecialty)
      .then((res) => {
        const specialtyActive = res.data.filter(
          (item) => item.isActive === true
        );
        setSpecialty(specialtyActive);
      })
      .catch((err) => {
        alert(err.response.data);
      });
  }, []);

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
              {specialty.map((option) => (
                <TouchableOpacity
                  key={option.specialtyId}
                  style={styles.optionContainer}
                  onPress={() => handleProblemSelect(option.specialtyId)}
                >
                  <SpecialtyCard
                    specialtyId={option.specialtyId}
                    selectedOption={selectedOption}
                    specialtyIcon={option.specialtyIcon}
                    specialtyName={option.specialtyName}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleNext}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
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
    justifyContent: "center",
    paddingHorizontal: 16,
    marginTop: 35,
  },
  cardContainer: {
    width: 270,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 1,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  optionContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  optionTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    padding: 20,
  },
  button: {
    backgroundColor: "green",
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
};
