import React from "react";
import {
  Modal,
  TouchableOpacity,
  View,
  Text,
  Linking,
  StyleSheet,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const WazeNavigationModal = ({
  showModal,
  setShowModal,
  handleLaunchWaze,
  location,
}) => {
  return (
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
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
          <MaterialCommunityIcons name="waze" size={64} color="black" />
          <Text style={styles.modalText}>Navigate with Waze to {location}</Text>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              handleLaunchWaze();
            }}
          >
            <Text style={styles.modalButtonText}>Launch Waze</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
const styles = {
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
export default WazeNavigationModal;
