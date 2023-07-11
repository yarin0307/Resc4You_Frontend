import { View, Text } from "react-native";
import React from "react";
import { CheckBox } from "react-native-elements";

export default function SpecialtyCheckbox({ title, checked, onPress }) {
  return (
    <CheckBox
      title={title}
      checked={checked}
      onPress={onPress}
      checkedColor="green"
      textStyle={{ fontSize: 12 }}
      containerStyle={{ backgroundColor: "transparent", borderWidth: 0 }}
    />
  );
}
