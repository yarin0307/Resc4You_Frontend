import { View, Text } from 'react-native'
import { Card } from "react-native-elements";
import React from 'react'
import Icon from "react-native-vector-icons/MaterialCommunityIcons";


export default function SpecialtyCard({selectedOption,specialtyIcon,specialtyName,specialtyId}) {
    return (
        <View>
            <Card
                containerStyle={[
                    styles.cardContainer,
                    selectedOption === specialtyId && {
                        backgroundColor: "#00ba00",
                    },
                ]}
            >
                <View style={styles.optionTextContainer}>
                    <Icon name={specialtyIcon} size={24} />
                    <Text style={styles.optionText}>
                        {specialtyName}
                    </Text>
                </View>
            </Card>
        </View>
    )
}

const styles = {

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

};
