import { View, Text } from "react-native";
import React from "react";
import { ActivityIndicator } from "react-native";

export default function LoadingSpinner() {
  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
}
