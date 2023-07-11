import React from "react";
import { View, Text, TouchableOpacity, Modal, Linking } from "react-native";

import { Card } from "react-native-elements";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import "intl";
import "intl/locale-data/jsonp/en"; // or any other locale you need
import { useState } from "react";
import CitizenRequestStatusCPage from "../Pages/CitizenRequestStatusCPage";

const RequestCardCitizen = ({
  requestIcon,
  requestType,
  requestDate,
  requestLocation,
  requestStatus,
  requestId,
  cancelRequest,
  isReviewed,
  volunteerHandle,
}) => {
  let formattedDate;
  if (Platform.OS === "ios") {
    formattedDate = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(requestDate));
  } else {
    formattedDate = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC", // specify UTC time zone
      hour12: false, // specify 24-hour format
    }).format(new Date(requestDate));
  }
  const handleCancelRequest = () => {
    cancelRequest(requestId, requestStatus);
  };
  const [showModal, setShowModal] = useState(false);
  const handleReview = () => {

    setShowModal(true);
  };

  const volunteerHandleDetails = volunteerHandle.split(" ");
  return (
    <View>
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowModal(false);
        }}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={() => setShowModal(true)}
          >
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowModal(false)}
            >
            </TouchableOpacity>
            <CitizenRequestStatusCPage requestId={requestId} />

          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
      <Card containerStyle={styles.cardContainer}>
        <View style={styles.cardHeader}>
          <Icon name={requestIcon} size={24} color="black" />
          <Text
            style={[
              styles.requestStatus,
              requestStatus === "Closed" && { color: "red" },
            ]}
          >
            {requestStatus}
          </Text>
        </View>
        <View style={styles.requestDetailsContainer}>
          <Text style={styles.requestDetailsLabel}>Request Type:</Text>
          <Text style={styles.requestDetailsValue}>{requestType}</Text>
        </View>
        <View style={styles.requestDetailsContainer}>
          <Text style={styles.requestDetailsLabel}>Date:</Text>
          <Text style={styles.requestDetailsValue}>{formattedDate}</Text>
        </View>
        <View style={styles.requestDetailsContainer}>
          <Text style={styles.requestDetailsLabel}>Location:</Text>
          <Text style={styles.requestDetailsValue}>{requestLocation}</Text>
        </View>
        {(requestStatus === "Waiting" || requestStatus === "In Progress") && (
          <View style={styles.buttonContainerForCitizen}>
            <TouchableOpacity
              style={styles.buttonCancel}
              onPress={handleCancelRequest}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
        {requestStatus === "Closed" && (
          <View style={styles.requestDetailsContainer}>
            <Text style={styles.requestDetailsLabel}>Assisted By:</Text>
            <Text style={styles.requestDetailsValue}>
              <Text
                style={{ color: "blue", textDecorationLine: "underline" }}
                onPress={() => Linking.openURL(`tel:${volunteerHandleDetails[2]}`)}
              >
                {volunteerHandle}
              </Text>
            </Text>
          </View>
        )}

        {(requestStatus === "Closed" && isReviewed == 0) && (
          <View style={styles.buttonContainerForCitizen}>
            <TouchableOpacity
              style={styles.buttonReview}
              onPress={handleReview}
            >
              <Text style={styles.buttonText}>Write Review</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
    </View>
  );
};

const styles = {
  cardContainer: {
    margin: 20,
    borderRadius: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  requestNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  requestStatus: {
    fontSize: 18,
    color: "#009933",
  },
  requestDetailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  requestDetailsLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    width: "40%",
  },
  requestDetailsValue: {
    fontSize: 14,
    color: "#333",
    width: "60%",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    flexDirection: "row",
  },
  buttonContainerForCitizen: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  buttonCancel: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 8,
  },
  buttonReview: {
    backgroundColor: "navy",
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonAccept: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseButton: {
    position: "absolute",
    top: 5,
    right: 5,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 22,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    borderColor: "rgba(0, 0, 0, 0.1)",
    height: "70%",
    width: "70%",
  },
  modalText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    color: "black",
  },
  modalButton: {
    backgroundColor: "#26BAE8",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
};

export default RequestCardCitizen;
