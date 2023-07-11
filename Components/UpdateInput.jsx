import React, { useState } from "react";
import { View, TouchableOpacity, TextInput, Text } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

export default function UpdateInput({
  value,
  onChangeText,
  label,
  keyboardType,
  secureTextEntry,
  edit,
}) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <View
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row-reverse",
          }}
        >
          <TextInput
            value={value}
            onChangeText={onChangeText}
            editable={edit}
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
            style={[
              {
                backgroundColor: "#fff",
                padding: 10,
                borderRadius: 5,
                width: "80%",
                marginVertical: 10,
              },
            ]}
          />
        </View>
      </View>
    </>
  );
}

const styles = {
  label: {
    fontSize: 16,
    paddingTop: 5,
    paddingBottom: 5,
  },
  pencilIcon: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    width: "70%",
  },
};
