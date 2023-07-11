import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { Card } from "react-native-elements";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import "intl";
import "intl/locale-data/jsonp/en"; // or any other locale you need

const RequestCardVolunteer = ({
  requestIcon,
  requestType,
  requestDate,
  requestLocation,
  requestStatus,
  requestId,
  cancelRequest,
  acceptRequest,
  showDetails,
  citizenPushToken,
  from,
  closeRequest,
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
    cancelRequest(requestId, citizenPushToken);
  };
  const handleAcceptRequest = () => {
    acceptRequest(requestId, requestLocation, citizenPushToken);
  };
  const handleCloseRequest = () => {
    closeRequest(requestId);
  };
  const handleShowDetails = () => {
    showDetails(requestId);
  };
  return (
    <View>
      <Card containerStyle={styles.cardContainer}>
        <View style={styles.cardHeader}>
          <Icon name={requestIcon} size={24} color="black" />
          <Text
            style={[
              styles.requestStatus,
              requestStatus === "Closed" && { color: "red" },
            ]}
          >
            {from === "My" ? (
              requestStatus
            ) : (
              <TouchableOpacity onPress={handleShowDetails}>
                <Icon name="information" size={20} color="#000" />
              </TouchableOpacity>
            )}
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

        {requestStatus === "Waiting" && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.buttonCancel}
              onPress={handleCancelRequest}
            >
              <Text style={styles.buttonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonAccept}
              onPress={handleAcceptRequest}
            >
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        )}
        {requestStatus === "In Progress" && from == "My" && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleShowDetails}>
              <Icon
                style={styles.InfoIcon}
                name="information"
                size={20}
                color="#000"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonCancel}
              onPress={handleCancelRequest}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCloseRequest}
              style={styles.buttonClose}
            >
              <Text style={styles.buttonText}>Close Request</Text>
            </TouchableOpacity>
          </View>
        )}
        {requestStatus === "Closed" && from == "My" && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleShowDetails}>
              <Icon name="information" size={20} color="#000" />
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
    alignItems: "flex-start",
    flexDirection: "row",
  },
  buttonContainerForVolunteer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  buttonCancel: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 8,
  },
  buttonClose: {
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
  InfoIcon: {
    marginBottom: 10,
    marginLeft: 2,
  },
};

export default RequestCardVolunteer;
