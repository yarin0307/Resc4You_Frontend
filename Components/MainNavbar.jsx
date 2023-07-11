import Icon from "react-native-vector-icons/Ionicons";
import { View, Text, TouchableOpacity } from "react-native";
import { AuthContext } from "../Context/AuthProvider";

import React from "react";

export default function MainNavbar(props) {
  const { handleLogout } = React.useContext(AuthContext);
  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }} />

    </View>
  );
}

const styles = {
  container: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "space-evenly",
    marginBottom: 10,
    marginTop: 5,
  },

  logoutButton: {
    padding: 10,
    backgroundColor: "red",
    borderRadius: 5,
  },
  logoutText: {
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  materialIcon: {
    width: 40,
    height: 40,
    marginLeft: 1,
  },
};
