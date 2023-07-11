import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RegistrationCitizenPage from "./Pages/RegistrationCitizenPage";
import HomePage from "./Pages/HomePage";
import RegistrationVolunteerPage from "./Pages/RegistrationVolunteerPage";
import UpdateDetailsCitizenPage from "./Pages/UpdateDetailsCitizenPage";
import UpdateDetailsVolunteerPage from "./Pages/UpdateDetailsVolunteerPage";
import AuthContext from "./Context/AuthProvider";
import RequestCounterContext from "./Context/RequestCounterProvider";
import LoginPage from "./Pages/LoginPage";
import CitizenRequestAPage from "./Pages/CitizenRequestAPage";
import CitizenRequestBPage from "./Pages/CitizenRequestBPage";
import CitizenRequestCPage from "./Pages/CitizenRequestCPage";
import CitizenDrawer from "./Components/CitizenDrawer";
import VolunteerDrawer from "./Components/VolunteerDrawer";
import CitizenRequestStatusAPage from "./Pages/CitizenRequestStatusAPage";
import CitizenRequestPage from "./Pages/CitizenRequestPage";
import MyRequestsVolunteerPage from "./Pages/MyRequestsVolunteerPage";
import AvailableRequestVolunteerPage from "./Pages/AvailableRequestVolunteerPage";
import VolunteerAvailablityStatusPage from "./Pages/VolunteerAvailablityStatusPage";
import AvailableStatusProvider from "./Context/AvailableStatusProvider";
import CitizenRequestStatusBPage from "./Pages/CitizenRequestStatusBPage";
import CitizenRequestStatusCPage from "./Pages/CitizenRequestStatusCPage";
import VolunteerChatGroups from "./Pages/VolunteerChatGroups";
import ChatCarElectricians from "./Pages/ChatCarElectricians";
import ChatCarMechanics from "./Pages/ChatCarMechanics";
import ChatElevetors from "./Pages/ChatElevetors";
import KMContext from "./Context/KMProvider";
import axios from "axios";

axios.defaults.baseURL = "https://proj.ruppin.ac.il/cgroup49/prod/";
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <AuthContext>
        <RequestCounterContext>
          <AvailableStatusProvider>
            <KMContext>
              <Stack.Navigator initialRouteName="HomePage">
                <Stack.Screen
                  options={{ headerTitle: "", headerTransparent: true }}
                  name="HomePage"
                  component={HomePage}
                />
                <Stack.Screen
                  options={{ headerTitle: "", headerTransparent: true }}
                  name="LoginPage"
                  component={LoginPage}
                />
                <Stack.Screen
                  options={{ headerTitle: "", headerTransparent: true }}
                  name="RegistrationCitizenPage"
                  component={RegistrationCitizenPage}
                />
                <Stack.Screen
                  options={{ headerTitle: "", headerTransparent: true }}
                  name="RegistrationVolunteerPage"
                  component={RegistrationVolunteerPage}
                />
                <Stack.Screen
                  options={{ headerTitle: "", headerTransparent: true }}
                  name="UpdateDetailsCitizenPage"
                  component={UpdateDetailsCitizenPage}
                />
                <Stack.Screen
                  options={{ headerTitle: "", headerTransparent: true }}
                  name="UpdateDetailsVolunteerPage"
                  component={UpdateDetailsVolunteerPage}
                />
                <Stack.Screen
                  options={{
                    headerShown: false,
                  }}
                  name="CitizenRequestAPage"
                  component={CitizenRequestAPage}
                />
                <Stack.Screen
                  options={{
                    headerShown: false,
                  }}
                  name="CitizenRequestBPage"
                  component={CitizenRequestBPage}
                />
                <Stack.Screen
                  options={{
                    headerShown: false,
                  }}
                  name="CitizenRequestCPage"
                  component={CitizenRequestCPage}
                />
                <Stack.Screen
                  options={{
                    headerShown: false,
                  }}
                  name="CitizenRequestPage"
                  component={CitizenRequestPage}
                />
                <Stack.Screen
                  options={{
                    headerShown: false,
                  }}
                  name="CitizenDrawer"
                  component={CitizenDrawer}
                />
                <Stack.Screen
                  options={{ headerTitle: "", headerTransparent: true }}
                  name="Volunteer Availablity Status"
                  component={VolunteerAvailablityStatusPage}
                />
                <Stack.Screen
                  options={{ headerTitle: "", headerTransparent: true }}
                  name="Available Requests"
                  component={AvailableRequestVolunteerPage}
                />
                <Stack.Screen
                  options={{ headerTitle: "", headerTransparent: true }}
                  name="My Requests"
                  component={MyRequestsVolunteerPage}
                />
                <Stack.Screen
                  options={{
                    headerShown: false,
                  }}
                  name="VolunteerDrawer"
                  component={VolunteerDrawer}
                />
                <Stack.Screen
                  options={{ headerTitle: "", headerTransparent: true }}
                  name="CitizenRequestStatusAPage"
                  component={CitizenRequestStatusAPage}
                />
                <Stack.Screen
                  options={{ headerTitle: "", headerTransparent: true }}
                  name="CitizenRequestStatusBPage"
                  component={CitizenRequestStatusBPage}
                />
                <Stack.Screen
                  options={{ headerTitle: "", headerTransparent: true }}
                  name="CitizenRequestStatusCPage"
                  component={CitizenRequestStatusCPage}
                />
                <Stack.Screen
                  options={{ headerTitle: "", headerTransparent: true }}
                  name="VolunteerChatGroups"
                  component={VolunteerChatGroups}
                />
                <Stack.Screen
                  options={{ headerTitle: "", headerTransparent: true }}
                  name="ChatCarElectricians"
                  component={ChatCarElectricians}
                />
                <Stack.Screen
                  options={{ headerTitle: "", headerTransparent: true }}
                  name="ChatCarMechanics"
                  component={ChatCarMechanics}
                />
                <Stack.Screen
                  options={{ headerTitle: "", headerTransparent: true }}
                  name="ChatElevetors"
                  component={ChatElevetors}
                />
              </Stack.Navigator>
            </KMContext>
          </AvailableStatusProvider>
        </RequestCounterContext>
      </AuthContext>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
