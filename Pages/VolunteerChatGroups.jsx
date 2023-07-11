import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import GroupList from '../Components/GroupList';

const chatGroups = ["Car Electricians", "Car Mechanics", "Elevators"];
export default function VolunteerChatGroups() {
    return (
        <View style={{ backgroundColor: "white", height: "100%" }}>
            <ScrollView>
                <Text style={styles.headline}>Choose an expert chat</Text>
                <View>
                    {chatGroups.map((grp, index) => (
                    <GroupList Group={grp} key={index} />
                    ))}
                </View>
            </ScrollView>
        </View>
    )
}
const styles = StyleSheet.create({
    headline: {
        fontSize: 28,
        fontWeight: "bold",
        paddingTop: 50,
        paddingBottom: 30,
        textAlign: "center",
    },
});