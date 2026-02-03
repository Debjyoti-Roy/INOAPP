import React, { useEffect } from "react";
import {DeviceEventEmitter} from "react-native"
import {
  Provider as PaperProvider,
  MD3LightTheme as DefaultTheme,
} from "react-native-paper";
import BottomTabs from "../components/Tab/BottomTabs";
import { RootSiblingParent } from "react-native-root-siblings";
import { Provider } from "react-redux";
import store from "../components/Redux/store";
import auth from "@react-native-firebase/auth";

import * as SecureStore from "expo-secure-store";
import {
  startTokenRefresh,
  stopTokenRefresh,
} from "@/components/MainComponents/Profile";

import * as Linking from "expo-linking";
import {
  NavigationContainer,
  LinkingOptions,
  NavigationIndependentTree,
} from "@react-navigation/native";

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#1976D2",
    onPrimary: "#ffffff",
    rangeContainerColor: "#bbdefb",
    onRangeContainerColor: "#1976D2",
  },
};

// ----------------------
// 🔥 Define Root Params
// ----------------------
export type RootStackParamList = {
  Home: undefined;
  Bookings: undefined;
  Queries: undefined;
  Profile: undefined;
};

// ----------------------
// 🔥 Linking Config (Typed)
// ----------------------
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL("/"), "https://www.ino.com"],

  config: {
    screens: {
      Home: {
        screens: {
          hotelsSearch: "",
          searchpage: "hotelsearch",
          hoteldetailspage: "details",

          carPackageSearch: "carpackagesearch",
          CarPackageDetails: "carpackagedetails",

          toursearch: "tourpackagesearch",
          tourdetails: "tourdetails",
        },
      },

      Bookings: "bookings",
      Queries: "queries",

      Profile: {
        screens: {
          ProfileHome: "profile",
          MyProfile: "profile/me",
        },
      },
    },
  },
};

export default function RootLayout() {
  useEffect(() => {
    const checkUserData = async () => {
      try {
        const storedUser = await SecureStore.getItemAsync("userData");
        if (storedUser) startTokenRefresh();
        else console.log("No userData found, skipping refresh");
      } catch (err) {
        console.error("Error reading userData:", err);
      }
    };

    checkUserData();
    return () => stopTokenRefresh();
  }, []);

  useEffect(() => {
  const job = async () => {
    try {
      const current = auth().currentUser;
      if (current) {
        const newToken = await current.getIdToken(true);
        await SecureStore.setItemAsync("token", newToken);
        DeviceEventEmitter.emit("userDataUpdated");
      }
    } catch (error) {
      console.log("Token refresh error:", error);
    }
  };

  // Run once immediately
  job();

  // Run every 40 minutes
  const intervalId = setInterval(job, 40 * 60 * 1000);

  // Cleanup on unmount
  return () => clearInterval(intervalId);
}, []);


  return (
    <Provider store={store}>
      <PaperProvider theme={theme}>
        <RootSiblingParent>
          {/* <NavigationContainer linking={linking}>
            <BottomTabs />
          </NavigationContainer> */}
          <NavigationIndependentTree>
            <NavigationContainer linking={linking}>
              <BottomTabs />
            </NavigationContainer>
          </NavigationIndependentTree>
        </RootSiblingParent>
      </PaperProvider>
    </Provider>
  );
}
