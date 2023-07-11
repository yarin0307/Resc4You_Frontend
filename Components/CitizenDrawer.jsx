import { View, Text, Image } from "react-native";
import React, { useEffect } from "react";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import UpdateDetailsCitizenPage from "../Pages/UpdateDetailsCitizenPage";
import CitizenRequestAPage from "../Pages/CitizenRequestAPage";
import CitizenRequestBPage from "../Pages/CitizenRequestBPage";
import CitizenRequestCPage from "../Pages/CitizenRequestCPage";
import { TouchableOpacity } from "react-native";
import { AuthContext } from "../Context/AuthProvider";
import { RequestCounterContext } from "../Context/RequestCounterProvider";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";
import CitizenRequestStatusAPage from "../Pages/CitizenRequestStatusAPage";
import CitizenRequestPage from "../Pages/CitizenRequestPage";
import CitizenRequestStatusBPage from "../Pages/CitizenRequestStatusBPage";
import CitizenRequestStatusCPage from "../Pages/CitizenRequestStatusCPage";
const Drawer = createDrawerNavigator();

export default function CitizenDrawer(props) {
  const phone = props.route.params.phone;
  const { handleLogout, user } = React.useContext(AuthContext);
  const { requestCounter, setRequestCounter } = React.useContext(
    RequestCounterContext
  );
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
  useEffect(() => {
    axios
      .get(`NumberCitizenOpenRequest/${phone}`)
      .then((res) => {
        setRequestCounter(res.data[0].numberOfOpened);
      })
      .catch((err) => {
        alert(err.response.data);
      });
  }, []);

  if (requestCounter === 0) {
    return (
      <Drawer.Navigator
        initialRouteName="Open Request"
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
          name="Open Request"
          component={CitizenRequestAPage}
          options={{
            drawerLabel: () => (
              <View style={styles.headerMenu}>
                <Text style={styles.linkText}>Start Request</Text>
                <Icon name="ios-add-circle" size={20} color="#000" />
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
          name="Ciztizen Request"
          component={CitizenRequestPage}
          options={{
            drawerLabel: () => (
              <View style={styles.headerMenu}>
                <Text style={styles.linkText}>My Requests</Text>
                <Icon name="ios-mail" size={20} color="#000" />
              </View>
            ),
            headerTitle: "My Requests",
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
          component={UpdateDetailsCitizenPage}
          options={{
            drawerLockMode: "locked-closed",
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
          name="CitizenRequestBPage"
          component={CitizenRequestBPage}
          options={{
            drawerItemStyle: { height: 0 },
            headerTitle: "Open Request",
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
          name="CitizenRequestCPage"
          component={CitizenRequestCPage}
          options={{
            drawerItemStyle: { height: 0 },
            headerTitle: "Open Request",
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
  } else {
    return (
      <Drawer.Navigator
        initialRouteName="Ciztizen Request"
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
          name="Ciztizen Request"
          component={CitizenRequestPage}
          options={{
            drawerLabel: () => (
              <View style={styles.headerMenu}>
                <Text style={styles.linkText}>My Requests</Text>
                <Icon name="ios-mail" size={20} color="#000" />
              </View>
            ),
            headerTitle: "My Requests",
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
          name="CitizenRequestStatusAPage"
          component={CitizenRequestStatusAPage}
          options={{
            drawerLabel: () => (
              <View style={styles.headerMenu}>
                <Text style={styles.linkText}>Request Status</Text>
                <Icon name="ios-information-circle" size={20} color="#000" />
              </View>
            ),
            headerTitle: "Request Status",
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
          component={UpdateDetailsCitizenPage}
          options={{
            drawerLockMode: "locked-closed",
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
          name="CitizenRequestStatusBPage"
          component={CitizenRequestStatusBPage}
          options={{
            drawerItemStyle: { height: 0 },
            headerTitle: "Request Status",
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
          name="CitizenRequestStatusCPage"
          component={CitizenRequestStatusCPage}
          options={{
            drawerItemStyle: { height: 0 },
            headerTitle: "Request Status",
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
