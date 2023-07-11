import { View, Text } from "react-native";
import React, { createContext } from "react";
import { useState } from "react";
export const KMContext = createContext();

export default function KMProvider(props) {
  const [km, setKm] = useState(0);
  return (
    <KMContext.Provider
      value={{
        km,setKm
      }}
    >
      {props.children}
    </KMContext.Provider>
  );
}
