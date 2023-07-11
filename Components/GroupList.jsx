import { View, Text, StyleSheet, TextInput, Modal, Alert, Pressable, TouchableOpacity } from 'react-native'
import React from 'react'
import { Card } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';

export default function GroupList(props) {
    const navigation = useNavigation();

    const handlePress = () => {

        if (props.Group === "Car Electricians") {
            navigation.navigate("ChatCarElectricians")
        }
        if (props.Group === "Car Mechanics") {
            navigation.navigate("ChatCarMechanics")
        }
        if (props.Group === "Elevators") {
            navigation.navigate("ChatElevetors")
        }

    }
    return (
        <View style={styles.GroupContainer}>
            <TouchableOpacity style={{ width: "70%" }} onPress={handlePress}>
                <Card containerStyle={styles.GroupCard}>
                    <View style={styles.GroupContainer}>
                        <Text style={styles.GroupText}>{props.Group}</Text>

                    </View>
                </Card>
            </TouchableOpacity>

        </View >
    )
}

const styles = StyleSheet.create({
    GroupContainer: {
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    GroupCard: {
        padding: 10,
        marginBottom: 10,
        borderRadius: 20,
        backgroundColor: '#03A9F4',
    },
    GroupText: {
        fontSize: 27,
        fontWeight: "bold",
        textAlign: "center",
        color: "white",
        marginTop: 1,
        justifyContent: "center",

    },

});