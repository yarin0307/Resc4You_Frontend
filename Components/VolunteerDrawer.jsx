import { View, Text, Image } from "react-native";
import React from "react";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { TouchableOpacity } from "react-native";
import { AuthContext } from "../Context/AuthProvider";
import Icon from "react-native-vector-icons/Ionicons";
import UpdateDetailsVolunteerPage from "../Pages/UpdateDetailsVolunteerPage";
import MyRequestsVolunteerPage from "../Pages/MyRequestsVolunteerPage";
import AvailableRequestVolunteerPage from "../Pages/AvailableRequestVolunteerPage";
import VolunteerAvailablityStatusPage from "../Pages/VolunteerAvailablityStatusPage";
import { AvailableStatusContext } from "../Context/AvailableStatusProvider";
import VolunteerChatGroups from "../Pages/VolunteerChatGroups";
import ChatCarElectricians from "../Pages/ChatCarElectricians";
import ChatCarMechanics from "../Pages/ChatCarMechanics";
import ChatElevetors from "../Pages/ChatElevetors";
const Drawer = createDrawerNavigator();

export default function VolunteerDrawer(props) {
  const phone = props.route.params?.phone;
  const { handleLogout, user } = React.useContext(AuthContext);
  const { isAvailable } = React.useContext(AvailableStatusContext);
  const CustomDrawerHeader = () => (
    <View style={styles.drawerHeader}>
      <View style={styles.userInfo}>
        <Text style={styles.username}>
          {user.FName} {user.LName}
        </Text>
      </View>
      <View style={styles.appIcon}>
        <Image
          source={require("../assets/logo.png")}
          style={styles.appIconImage}
        />
      </View>
    </View>
  );
  return (
    <Drawer.Navigator
      initialRouteName="Volunteer Availablity Status"
      drawerContent={(props) => {
        return (
          <DrawerContentScrollView {...props}>
            <CustomDrawerHeader />
            <DrawerItemList {...props} />
          </DrawerContentScrollView>
        );
      }}
    >
      <Drawer.Screen
        name="Volunteer Availablity Status"
        component={VolunteerAvailablityStatusPage}
        initialParams={{ phone: phone }}
        options={{
          drawerLabel: () => (
            <View style={styles.headerMenu}>
              <Text style={styles.linkText}>My Status</Text>
              <Icon name="ios-information-circle" size={20} color="#000" />
            </View>
          ),
          headerTitle: "My Status",
          headerRight: () => (
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          ),
        }}
      />
      {isAvailable && (
        <Drawer.Screen
          name="Available Requests"
          component={AvailableRequestVolunteerPage}
          initialParams={{ phone: phone }}
          options={{
            drawerLabel: () => (
              <View style={styles.headerMenu}>
                <Text style={styles.linkText}>Requests</Text>
                <Icon name="ios-mail" size={20} color="#000" />
              </View>
            ),
            headerTitle: "",
            headerRight: () => (
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            ),
          }}
        />
      )}
      <Drawer.Screen
        name="My Requests"
        component={MyRequestsVolunteerPage}
        options={{
          drawerLabel: () => (
            <View style={styles.headerMenu}>
              <Text style={styles.linkText}>My Requests</Text>
              <Icon name="ios-person" size={20} color="#000" />
            </View>
          ),
          headerTitle: "",
          headerRight: () => (
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Drawer.Screen
        name="Update Details"
        component={UpdateDetailsVolunteerPage}
        options={{
          drawerLabel: () => (
            <View style={styles.headerMenu}>
              <Text style={styles.linkText}>Update Details</Text>
              <Icon name="ios-pencil-sharp" size={20} color="#000" />
            </View>
          ),
          headerRight: () => (
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Drawer.Screen
        name="VolunteerChatGroups"
        component={VolunteerChatGroups}
        options={{
          drawerLabel: () => (
            <View style={styles.headerMenu}>
              <Text style={styles.linkText}>Chat</Text>
              <Icon name="ios-chatbubble-ellipses" size={20} color="#000" />
            </View>
          ),
          headerTitle: "Chat",
          headerRight: () => (
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Drawer.Screen
        name="ChatCarElectricians"
        component={ChatCarElectricians}
        options={{
          drawerItemStyle: { height: 0 },
          drawerLabel: () => (
            <View style={styles.headerMenu}>
              <Text style={styles.linkText}>Chat</Text>
              <Icon name="ios-chatbubble-ellipses" size={20} color="#000" />
            </View>
          ),
          headerTitle: "Electricians Chat",
          headerRight: () => (
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Drawer.Screen
        name="ChatCarMechanics"
        component={ChatCarMechanics}
        options={{
          drawerItemStyle: { height: 0 },
          drawerLabel: () => (
            <View style={styles.headerMenu}>
              <Text style={styles.linkText}>Chat</Text>
              <Icon name="ios-chatbubble-ellipses" size={20} color="#000" />
            </View>
          ),
          headerTitle: "Mechanics Chat",
          headerRight: () => (
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Drawer.Screen
        name="ChatElevetors"
        component={ChatElevetors}
        options={{
          drawerItemStyle: { height: 0 },
          drawerLabel: () => (
            <View style={styles.headerMenu}>
              <Text style={styles.linkText}>Chat</Text>
              <Icon name="ios-chatbubble-ellipses" size={20} color="#000" />
            </View>
          ),
          headerTitle: "Elevetors Chat",
          headerRight: () => (
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          ),
        }}
      />
    </Drawer.Navigator>
  );
}
const styles = {
  drawerHeader: {
    // backgroundColor: "beige",
    height: 120,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 16,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  appIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  appIconImage: {
    width: 40,
    height: 40,
  },
  logoutButton: {
    padding: 5,
    backgroundColor: "red",
    borderRadius: 5,
    marginRight: 4,
  },
  logoutText: {
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  headerMenu: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
};
