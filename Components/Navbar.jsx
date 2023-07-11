import { View, Text, StyleSheet, Image } from "react-native";
import React from "react";

export default function Navbar({ type }) {
  return (
    <>
      <Text style={type === "Register" ? styles.title : styles.headline}>
        Resc4You
      </Text>
      <Image style={styles.logo} source={require("../assets/logo.png")} />
    </>
  );
}
const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "bold",
    paddingBottom: 30,
    textAlign: "center",
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 50,
  },
  headline: {
    fontSize: 40,
    marginTop: -50,
    marginBottom: 50,
    textAlign: "center",
  },
});
