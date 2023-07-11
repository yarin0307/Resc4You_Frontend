import { View, Text } from "react-native";
import React from "react";
import { createContext } from "react";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
export const AuthContext = createContext();
import { useNavigation } from "@react-navigation/native";

export default function AuthProvider(props) {
  const navigation = useNavigation();
  const deleteToken = async () => {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.log(e);
    }
  };

  const handleLogout = () => {
    setUser({});
    deleteToken();
    navigation.reset({
      index: 0,
      routes: [{ name: "HomePage" }],
    });
  };
  const [user, setUser] = useState({});
  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        handleLogout
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
