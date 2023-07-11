import { View, Text } from "react-native";
import React, { createContext } from "react";
import { useState } from "react";
export const AvailableStatusContext = createContext();

export default function AvailableStatusProvider(props) {
  const [isAvailable, setIsAvailable] = useState(false);
  return (
    <AvailableStatusContext.Provider
      value={{
        isAvailable,
        setIsAvailable,
      }}
    >
      {props.children}
    </AvailableStatusContext.Provider>
  );
}
