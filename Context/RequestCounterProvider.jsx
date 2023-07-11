import { View, Text } from "react-native";
import React, { createContext } from "react";
import { useState } from "react";
export const RequestCounterContext = createContext();

export default function RequestCounterProvider(props) {
  const [requestCounter, setRequestCounter] = useState(0);
  return (
    <RequestCounterContext.Provider
      value={{
        requestCounter,
        setRequestCounter,
      }}
    >
      {props.children}
    </RequestCounterContext.Provider>
  );
}
