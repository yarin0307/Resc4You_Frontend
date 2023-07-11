import React, { useState } from "react";
import {
    Modal,
    TouchableOpacity,
    View,
    Text,
    Linking,
    StyleSheet,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import MapView, { Marker } from 'react-native-maps';

const MapModal = ({
    showMapModal,
    setShowMapModal,
    markers,
    requestList,
    setSelectedRequestDetails,
    setShowModalDetails
}) => {
    const [region, setRegion] = useState({
        latitude: 31.4117257,
        longitude: 35.0818155,
        latitudeDelta: 3,
        longitudeDelta: 3,
    });
    const showMarkerDetails = (id) => {
        const selectedRequest = requestList.find(
            (req) => req.requestId === id
          );
          setSelectedRequestDetails(selectedRequest);
          setShowMapModal(false);
          setShowModalDetails(true);
    }
    return (
        <Modal
            visible={showMapModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowMapModal(false)}
        >
            <TouchableOpacity
                style={styles.modalContainer}
                activeOpacity={1}
            >
                <View style={styles.modalContent}>
                    <TouchableOpacity
                        style={styles.modalCloseButton}
                        onPress={() => setShowMapModal(false)}
                    >
                        <Ionicons name="close" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.modalText}>Show Requests Map</Text>
                    {showMapModal && (
                        <View style={{ alignItems: "flex-start", height: 300, width: 300 }}>
                            {console.log(markers)}
                            <MapView
                                style={styles.map}
                                region={region}
                                onRegionChangeComplete={region => setRegion(region)}
                            >
                                {markers.map((marker, index) => (
                                    <Marker key={index} coordinate={marker.coordinate} pinColor="green" onPress={() => showMarkerDetails(marker.title)} />
                                ))}
                            </MapView>
                        </View>
                    )}
                    <TouchableOpacity
                        style={styles.modalDetailsButton}
                        onPress={() => setShowMapModal(false)}
                    >
                        <Text style={styles.modalButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};
const styles = StyleSheet.create({
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
        marginBottom: 20,
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
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
});
export default MapModal;
