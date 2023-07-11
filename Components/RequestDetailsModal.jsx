import React from "react";
import {
  Modal,
  TouchableOpacity,
  View,
  Text,
  Linking,
  StyleSheet,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";

const RequestDetailsModal = ({
  showModalDetails,
  selectedRequestDetails,
  setShowModalDetails,
}) => {
  return (
    <Modal
      visible={showModalDetails}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowModalDetails(false)}
    >
      <TouchableOpacity
        style={styles.modalContainer}
        activeOpacity={1}
        onPress={() => setShowModalDetails(false)}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowModalDetails(false)}
          >
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.modalText}>Request Details</Text>
          {showModalDetails && (
            <View style={{ alignItems: "flex-start" }}>
              <Text style={styles.label}>
                Type: {selectedRequestDetails.specialtyName}
              </Text>
              <Text style={styles.label}>
                Date:{" "}
                {Platform.OS === "ios"
                  ? new Intl.DateTimeFormat("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(selectedRequestDetails.requestDate))
                  : new Intl.DateTimeFormat("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "UTC",
                      hour12: false,
                    }).format(new Date(selectedRequestDetails.requestDate))}
              </Text>
              <Text style={styles.label}>
                Location: {selectedRequestDetails.requestAddress}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(`tel:${selectedRequestDetails.citizenPhone}`)
                }
              >
                <Text style={styles.label}>
                  Contact: {selectedRequestDetails.citizenName + " "}
                  <Text
                    style={StyleSheet.flatten([styles.phoneLabel], {
                      color: "red",
                    })}
                  >
                    {selectedRequestDetails.citizenPhone}
                    {"  "}
                    <FontAwesome name="phone" size={16} />{" "}
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity
            style={styles.modalDetailsButton}
            onPress={() => setShowModalDetails(false)}
          >
            <Text style={styles.modalButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
const styles = {
  label: {
    fontSize: 16,
    paddingTop: 5,
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
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    color: "black",
  },
  modalDetailsButton: {
    backgroundColor: "red",
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
export default RequestDetailsModal;
