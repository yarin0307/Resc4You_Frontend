import ProgressBar from "../Components/ProgressBar";
import {
  View,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  TouchableOpacity,
  StyleSheet,
  Text,
  TextInput,
  Share,
} from "react-native";
import React, { useContext, useState, useEffect } from "react";
import MainNavbar from "../Components/MainNavbar";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";
import { RequestCounterContext } from "../Context/RequestCounterProvider";

const labels = ["Reported", "On The Way", "Problem Solved"];
const STAR_OUTLINE = "star-outline";
const STAR = "star";
const api = "UpdateRateOfRequest/";
export default function CitizenRequestStatusCPage(props) {
  const [currentPosition, setCurrentPosition] = useState(2);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState(null);
  const [result, setResult] = useState();
  const { requestCounter, setRequestCounter } = React.useContext(
    RequestCounterContext
  );
  const onStarPress = (starIndex) => {
    setRating(starIndex + 1);
  };

  const renderStars = () => {
    const starIcons = [];
    for (let i = 0; i < 5; i++) {
      const iconName = i < rating ? STAR : STAR_OUTLINE;

      starIcons.push(
        <TouchableOpacity key={i} onPress={() => onStarPress(i)}>
          <Icon
            name={iconName}
            size={30}
            color={i < rating ? "orange" : "gray"}
          />
        </TouchableOpacity>
      );
    }

    return starIcons;
  };
  const handleSendReview = () => {
    const requestId = props.requestId
      ? props.requestId
      : props.route.params.requestId;
    if (reviewText == null && rating == 0) {
      alert("Please enter a review and rate the service");
      return;
    }
    axios
      .put(api + requestId + "/Review/" + reviewText + "/Rating/" + rating)
      .then((res) => {
        alert("Thank you for your review!");
        setRequestCounter(0);
      })
      .catch((err) => {
        alert(err.resposne.data);
      });
  };
  const handleShare = () => {
    Share.share(
      {
        message: `I am happy to share that I got help from Resc4You\n\n
      Here is my review: ${reviewText} \n\n
       My Rating: ${rating}`,
        title: "React Native",
      },
      {
        tintColor: "green",
      }
    )
      .then(showResult)
      .catch((error) => setResult("error: " + error.message));
  };
  const showResult = (result) => {
    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        setResult("shared with an activityType: " + result.activityType);
      } else {
        setResult("shared");
      }
    } else if (result.action === Share.dismissedAction) {
      setResult("dismissed");
    }
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
          <View style={styles.container}>
            <ProgressBar
              currentPosition={currentPosition}
              labels={labels}
              stepCount={labels.length}
            />

            <Text style={styles.header}>Write a Review</Text>

            <TextInput
              style={styles.input}
              multiline={true}
              placeholder="Write your review here"
              value={reviewText}
              onChangeText={(text) => setReviewText(text)}
            />

            <View style={styles.ratingContainer}>{renderStars()}</View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleSendReview}
              >
                <Text style={styles.buttonText}>Send</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare}>
                <View style={styles.Sharebutton}>
                  <Text style={styles.buttonText}>Share</Text>
                </View>
              </TouchableOpacity>
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
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 50,
    marginBottom: 16,
    textAlign: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    padding: 8,
    height: 100,
    textAlignVertical: "top",
    marginTop: 10,
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "flex-end",
    padding: 20,
    marginTop: 10,
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
  Sharebutton: {
    backgroundColor: "navy",
    padding: 12,
    borderRadius: 8,
  },
});
