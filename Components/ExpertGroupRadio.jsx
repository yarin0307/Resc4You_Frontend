import { View, Text } from 'react-native'
import React from 'react'

export default function ExpertGroupRadio(props) {
    return (
        <View key={props.expertGroupId} style={styles.optionContainer}>
            <View style={styles.circle}>
                {props.selectedExpertGroup === props.expertGroupId && <View style={styles.checkedCircle} />}
            </View>
            <Text style={{ marginRight: 15 }} onPress={props.onPress}>{props.expertGroupName}</Text>
        </View>
    )
}

const styles = {
    
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        flexDirection: "row",
        flexBasis: "30%",
        margin: 5,
    },
    circle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'grey',
        marginRight: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkedCircle: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: 'green',
    },
};
