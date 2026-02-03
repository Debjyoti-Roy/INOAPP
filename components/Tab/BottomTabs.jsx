import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

import Bookings from '../MainComponents/Bookings';
import Queries from '../MainComponents/Queries';
import Profile from '../MainComponents/Profile';
import MyProfile from "../MainComponents/MyProfile";
import Mainpage from '../MainComponents/Mainpage';
import SearchPage from '../MainComponents/HotelSearchComponents/SearchPage';
import HotelDetailsPage from '../MainComponents/HotelSearchComponents/HotelDetailsPage';
import HotelBill from '../MainComponents/HotelSearchComponents/HotelBill';
import TourPackageSearchResults from '../MainComponents/TourPackageComponents/TourPackageSearchResults';
import TourPackageDetails from '../MainComponents/TourPackageComponents/TourPackageDetails';
import TourQueryDetails from '../MainComponents/TourPackageComponents/TourQueryDetails';
import CarPackageSearch from '../MainComponents/CarPackageComponents/CarPackageSearch';
import CarPackageDetails from '../MainComponents/CarPackageComponents/CarPackageDetails';
import CarPackageBill from '../MainComponents/CarPackageComponents/CarPackageBill';
import Myqueries from '../MainComponents/MyQueries/Myqueries'
import CarPickup from '../MainComponents/CarPickup'

const Stack = createNativeStackNavigator();

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="ProfileHome" component={Profile} options={{ headerShown: false }} />
      <Stack.Screen name="MyProfile" component={MyProfile} options={{ headerShown: false }} />
      <Stack.Screen name="MyQueries" component={Myqueries} options={{ headerShown: false }} />
      <Stack.Screen name="ContactUs" component={Queries} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function HotelStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="hotelsSearch" component={Mainpage} options={{ headerShown: false }} />
      <Stack.Screen name="searchpage" component={SearchPage} options={{ headerShown: false }} />
      <Stack.Screen name="hoteldetailspage" component={HotelDetailsPage} options={{ headerShown: false }} />
      <Stack.Screen name="hotelbill" component={HotelBill} options={{ headerShown: false }} />
      <Stack.Screen name="toursearch" component={TourPackageSearchResults} options={{ headerShown: false }} />
      <Stack.Screen name="tourdetails" component={TourPackageDetails} options={{ headerShown: false }} />
      <Stack.Screen name="tourbill" component={TourQueryDetails} options={{ headerShown: false }} />
      <Stack.Screen name="carPackageSearch" component={CarPackageSearch} options={{ headerShown: false }} />
      <Stack.Screen name="CarPackageDetails" component={CarPackageDetails} options={{ headerShown: false }} />
      <Stack.Screen name="CarPackageBill" component={CarPackageBill} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

const HomeIcon = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 10L12 3L21 10V20C21 21.1 20.1 22 19 22H5C3.9 22 3 21.1 3 20V10Z"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 22V14H15V22"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const HotelIcon = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="8" width="18" height="13" rx="2" stroke={color} strokeWidth="2.2" />
    <Path d="M7 12H9M7 16H9M15 12H17M15 16H17" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    <Path d="M11 16V21" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
  </Svg>
);

const CarIcon = ({ color = "#000", size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Upper Body (Roof & Windows) */}
    <Path
      d="M5 13L7 8a2 2 0 0 1 1.9-1.3h6.2A2 2 0 0 1 17 8l2 5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Lower Body (Chassis) */}
    <Path
      d="M2 13h20v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Wheels (Positioned to sit under the chassis) */}
    <Circle cx="7" cy="18" r="2" fill={color} />
    <Circle cx="17" cy="18" r="2" fill={color} />
    
    {/* Headlight (Optional detail) */}
    <Path d="M19 15h1" stroke={color} strokeWidth="1" strokeLinecap="round" />
  </Svg>
);

const UserIcon = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2.2" />
    <Path
      d="M5 21c0-4 3-6 7-6s7 2 7 6"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </Svg>
);

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'Home': return <HomeIcon color={color} size={size} />;
            case 'Bookings': return <HotelIcon color={color} size={size} />;
            case 'Car Pickup': return <CarIcon color={color} size={size} />;
            case 'Profile': return <UserIcon color={color} size={size} />;
            default: return null;
          }
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen
        name="Home"
        component={HotelStack}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'hotelsSearch';
          const isTabVisible = routeName !== 'searchpage' && routeName !== 'hoteldetailspage' && routeName !== 'hotelbill' && routeName !== 'toursearch' && routeName !== 'tourdetails' && routeName !== 'tourbill' && routeName !== 'carPackageSearch' && routeName !== 'CarPackageDetails' && routeName !== 'CarPackageBill';
          return {
            tabBarStyle: isTabVisible ? undefined : { display: 'none' },
          };
        }}
      />
      <Tab.Screen name="Car Pickup" component={CarPickup} />
      <Tab.Screen name="Bookings" component={Bookings} />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'ProfileHome';

          const isTabVisible =
            routeName !== "MyProfile" &&
            routeName !== "MyQueries";
            
          return {
            tabBarStyle: isTabVisible ? undefined : { display: "none" },
          };
        }}
      />

    </Tab.Navigator>
  );
}

{/* <Tab.Screen name="Queries" component={Queries} /> */}
{/* <Tab.Screen name="Profile" component={ProfileStack} /> */}