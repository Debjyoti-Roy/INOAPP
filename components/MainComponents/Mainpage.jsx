// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Dimensions,
//   Pressable,
//   Modal,
//   FlatList,
// } from 'react-native';
// import Animated, {
//   useSharedValue,
//   useAnimatedScrollHandler,
//   useAnimatedStyle,
//   interpolate,
//   Extrapolate,
// } from "react-native-reanimated";
// import TabButton from "./MainPageComponents/TabButton"
// import { Menu } from 'react-native-paper';
// import { DatePickerModal } from 'react-native-paper-dates';
// import { useDispatch, useSelector } from 'react-redux';
// import { getLocations, searchHotels } from '../Redux/hotelSlice';
// // import { useNavigation } from 'expo-router';
// import { useNavigation } from "@react-navigation/native";
// import Toast from 'react-native-root-toast';
// import { getDestinations, getPackages } from '../Redux/carPackageSlice';
// import * as SecureStore from "expo-secure-store";
// import { getTourPackages } from '../Redux/tourPackageSlice';
// import HotelRecentSearch from "../MainComponents/RecentSearchComponents/HotelRecentSearch"
// import CarRecentSearch from '../MainComponents/RecentSearchComponents/CarRecentSearch'
// import TourRecentSearch from '../MainComponents/RecentSearchComponents/TourRecentSearch'

// const { height } = Dimensions.get('window');
// // at top (already imported Animated etc.)
// const MAX_BANNER_HEIGHT = height * 0.14;
// const MIN_BANNER_HEIGHT = 60; // when shrunk
// const SCROLL_DISTANCE = MAX_BANNER_HEIGHT - MIN_BANNER_HEIGHT;


// const formattedDate = (dateString) => {
//   const date = new Date(dateString);

//   if (isNaN(date.getTime())) {
//     return "NOT_VALID"; // or return null / undefined based on your app's logic
//   }

//   // Add 1 day
//   date.setDate(date.getDate() + 1);

//   // Format as YYYY-MM-DD
//   const formattedDate = date.toISOString().split("T")[0];
//   return formattedDate;
// };

// const Mainpage = () => {
//   const { tourDetails, tourDetailsLoading, tourDetailsError, tourDetailsStatus } = useSelector((state) => state.tour)
//   const { packages, packagesLoading, packagesError, packagesStatus } = useSelector((state) => state.car)
//   const { searchResults, loading } = useSelector((state) => state.hotel);
//   const [location, setLocation] = useState('');
//   const [guests, setGuests] = useState('2 Adults • 1 Room');
//   const [checkIn, setCheckIn] = useState(null);
//   const [checkOut, setCheckOut] = useState(null);
//   const [activeTab, setActiveTab] = useState('hotels');
//   const [showPicker, setShowPicker] = useState(false);
//   const [currentStep, setCurrentStep] = useState('checkIn');
//   const [packageType, setPackageType] = useState('');
//   const [carDate, setCarDate] = useState(null);
//   const [visible, setVisible] = useState(false);
//   const [selected, setSelected] = useState('');
//   const navigation = useNavigation();
//   // const locations = ['Kolkata', 'Mumbai', 'Delhi', 'Bangalore'];
//   const [locations, setLocations] = useState([])
//   const [inputWidth, setInputWidth] = useState(0);
//   const [hotelSearchQuery, setHotelSearchQuery] = useState("")

//   //number of adults
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [adults, setAdults] = useState(2);
//   const [children, setChildren] = useState(0);
//   const [rooms, setRooms] = useState(1);

//   const incrementRooms = (setter) => setter((prev) => Math.min(prev + 1, 5));
//   const decrementRooms = (setter) => setter((prev) => Math.max(prev - 1, 1));

//   const increment = (setter) => setter((prev) => Math.min(prev + 1, 20));
//   const decrement = (setter) => setter((prev) => Math.max(prev - 1, 1));

//   // const {locations}=useSelector(state=>state.hotel)
//   const dispatch = useDispatch()


//   //Date
//   const [range, setRange] = useState({ startDate: undefined, endDate: undefined });

//   //tour
//   const [dest, setDest] = useState([])
//   const [showPopup, setShowPopup] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [showPackageDatePicker, setShowPackageDatePicker] = useState(false)
//   const [selectedTourDate, setSelectedTourDate] = useState(undefined)

//   //car Package
//   const [cardest, setCarDest] = useState([])
//   const [carLocation, setCarLocation] = useState("")
//   const [showcarPopup, setShowCarPopup] = useState(false);
//   const [carsearchQuery, setCarSearchQuery] = useState("");
//   const [showcarPackageDatePicker, setShowCarPackageDatePicker] = useState(false)
//   const [showHotelPopup, setShowHotelPopup] = useState(false)
//   const [selectedCarDate, setSelectedCarDate] = useState(undefined)
//   const { destinations } = useSelector((state) => state.car);
//   useEffect(() => {
//     dispatch(getDestinations());
//   }, [dispatch]);
//   useEffect(() => {
//     if (destinations?.length) {
//       const processedDestinations = [
//         ...new Set(
//           destinations.flatMap((item) =>
//             item.split(",").map((part) => part.trim())
//           )
//         ),
//       ];
//       setDest(processedDestinations)
//     }
//   }, [destinations])



//   const onConfirm = (params) => {
//     setShowPicker(false);

//     const addOneDay = (date) => {
//       const d = new Date(date);
//       d.setDate(d.getDate() + 1);
//       return d;
//     };

//     setCheckIn(params.startDate);
//     setCheckOut(params.endDate);
//   };


//   const job = async () => {
//     const data = await dispatch(getLocations())
//     setLocations(data.payload.data)
//   }
//   useEffect(() => {
//     job()
//   }, [])


//   const handleHotelSelect = (item) => {
//     setSelected(item);
//     setShowHotelPopup(false);
//     setHotelSearchQuery("");
//   };

//   const handleHotelSearchSubmit = () => {
//     const startDate = formattedDate(checkIn)
//     const endDate = formattedDate(checkOut)
//     if (selected === '') {
//       let toast = Toast.show("Select any location", {
//         duration: Toast.durations.SHORT,
//         position: Toast.positions.BOTTOM,
//         shadow: true,
//         animation: true,
//         hideOnPress: true,
//         delay: 0,
//       });
//       setTimeout(() => Toast.hide(toast), 2000);
//     } else if (!startDate || startDate === '1970-01-01' || startDate === null || !endDate || endDate === '1970-01-01' || endDate === null) {
//       let toast = Toast.show("Please Select Start date and End Date!", {
//         duration: Toast.durations.SHORT,
//         position: Toast.positions.BOTTOM,
//         shadow: true,
//         animation: true,
//         hideOnPress: true,
//         delay: 0,
//       });
//       setTimeout(() => Toast.hide(toast), 2000);
//     } else {
//       const total = adults + children
//       const myData = {
//         location: selected,
//         startDate,
//         endDate,
//         rooms,
//         total,
//         adults,
//         children
//       }
//       navigation.navigate("searchpage", { myData });
//     }

//   }

//   const hotelfiltered = locations.filter((item) =>
//     item.toLowerCase().includes(hotelSearchQuery.toLowerCase())
//   );
//   //tour
//   const filtered = dest.filter((item) =>
//     item.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const handleSelect = (item) => {
//     setLocation(item);
//     setShowPopup(false);
//     setSearchQuery("");
//   };
//   const formatToDDMMYYYY = (isoString) => {
//     if (!isoString) return "";

//     const date = new Date(isoString);
//     if (isNaN(date)) return "";

//     const day = String(date.getDate()).padStart(2, "0");
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const year = date.getFullYear();

//     return `${day}-${month}-${year}`;
//   };

//   const handleTourPackage = async () => {
//     const date = formatToDDMMYYYY(selectedTourDate)
//     if (!selectedTourDate || selectedTourDate === '1970-01-01' || selectedTourDate === null || !date || date === '1970-01-01' || date === null) {
//       let toast = Toast.show("Please Select Tour Date!", {
//         duration: Toast.durations.SHORT,
//         position: Toast.positions.BOTTOM,
//         shadow: true,
//         animation: true,
//         hideOnPress: true,
//         delay: 0,
//       });
//       setTimeout(() => Toast.hide(toast), 2000);
//       return;
//     } else if (!location || location === '' || location === null) {
//       let toast = Toast.show("Please Select the Location!", {
//         duration: Toast.durations.SHORT,
//         position: Toast.positions.BOTTOM,
//         shadow: true,
//         animation: true,
//         hideOnPress: true,
//         delay: 0,
//       });
//       setTimeout(() => Toast.hide(toast), 2000);
//       return;
//     } else {
//       const myData = {
//         location,
//         travelDate: date,
//       };
//       navigation.navigate("toursearch", { myData });
//     }
//   }
//   const handleCarPackage = async () => {
//     const date = formatToDDMMYYYY(selectedCarDate)
//     if (!selectedCarDate || selectedCarDate === '1970-01-01' || selectedCarDate === null || !date || date === '1970-01-01' || date === null) {
//       let toast = Toast.show("Please Select Date!", {
//         duration: Toast.durations.SHORT,
//         position: Toast.positions.BOTTOM,
//         shadow: true,
//         animation: true,
//         hideOnPress: true,
//         delay: 0,
//       });
//       setTimeout(() => Toast.hide(toast), 2000);
//       return;
//     } else if (!carLocation || carLocation === '' || carLocation === null) {
//       // } else if (!location || location === '' || location === null) {
//       let toast = Toast.show("Please Select the Location!", {
//         duration: Toast.durations.SHORT,
//         position: Toast.positions.BOTTOM,
//         shadow: true,
//         animation: true,
//         hideOnPress: true,
//         delay: 0,
//       });
//       setTimeout(() => Toast.hide(toast), 2000);
//       return;
//     } else {
//       const myData = {
//         location: carLocation,
//         travelDate: date,
//       };
//       navigation.navigate("carPackageSearch", { myData });
//     }
//   }

//   //car
//   const handleCarSelect = (item) => {
//     setCarLocation(item);
//     setShowCarPopup(false);
//     setCarSearchQuery("");
//   };
//   const carFiltered = dest.filter((item) =>
//     item.toLowerCase().includes(carsearchQuery.toLowerCase())
//   );
//   useEffect(() => {
//     const job = async () => {
//       if (activeTab === 'hotels') {
//         const hotelString = await SecureStore.getItemAsync("hotelSearchroute");
//         const hotel = hotelString ? JSON.parse(hotelString) : null;
//         dispatch(
//           searchHotels({
//             location: hotel.location,
//             checkIn: hotel.startDate,
//             checkOut: hotel.endDate,
//             requiredRoomCount: hotel.rooms,
//             page: 0,
//             size: 10,
//           })
//         );
//         // console.log(hotel)
//       } else if (activeTab === 'packages') {
//         const packagesString = await SecureStore.getItemAsync("tourSearchroute");
//         const packages = packagesString ? JSON.parse(packagesString) : null;
//         const [day, month, year] = packages.travelDate.split("-");
//         dispatch(getTourPackages({ area: packages.location, month: month }))
//         // console.log(packages)
//       } else if (activeTab === 'cars') {
//         const carsString = await SecureStore.getItemAsync("carSearchroute");
//         const cars = carsString ? JSON.parse(carsString) : null;
//         const [day, month, year] = cars.travelDate.split("-");
//         dispatch(getPackages({ area: myData.location, month: month }))
//       }
//     }
//     job()
//   }, [activeTab])

//   const renderRecentSearch = () => {
//     if (activeTab === 'hotels') {
//       return (
//         <HotelRecentSearch />
//       )
//     } else if (activeTab === 'cars') {
//       return (
//         <CarRecentSearch />
//       )
//     } else if (activeTab === 'packages') {
//       return (
//         <TourRecentSearch />
//       )
//     }
//   }

//   //ANIMATION
//   // ANIMATION
// const scrollY = useSharedValue(0);

// const onScroll = useAnimatedScrollHandler({
//   onScroll: (event) => {
//     scrollY.value = event.contentOffset.y;
//   },
// });

// const bannerAnimatedStyle = useAnimatedStyle(() => {
//   const bannerHeight = interpolate(
//     scrollY.value,
//     [0, SCROLL_DISTANCE],
//     [MAX_BANNER_HEIGHT, MIN_BANNER_HEIGHT],
//     Extrapolate.CLAMP
//   );
//   return {
//     height: bannerHeight,
//   };
// });

// const titleAnimatedStyle = useAnimatedStyle(() => {
//   const opacity = interpolate(
//     scrollY.value,
//     [0, 40],
//     [1, 0],
//     Extrapolate.CLAMP
//   );
//   const translateY = interpolate(
//     scrollY.value,
//     [0, 40],
//     [0, -20],
//     Extrapolate.CLAMP
//   );
//   return {
//     opacity,
//     transform: [{ translateY }],
//   };
// });





//   const renderSearchBox = () => {
//     if (activeTab === 'hotels') {
//       return (
//         <View style={styles.searchBox}>
//           <Text style={styles.title}>Find Your Perfect Stay</Text>
//           <Text style={styles.label}>Location</Text>
//           <TouchableOpacity onPress={() => setShowHotelPopup(true)}>
//             <TextInput
//               style={styles.input}
//               placeholder="Select location"
//               placeholderTextColor="#666"
//               value={selected}
//               editable={false}
//             />
//           </TouchableOpacity>
//           <Text style={styles.label}>Dates</Text>
//           <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)}>
//             <Text style={{ color: checkIn && checkOut ? '#000' : '#666' }}>
//               {checkIn && checkOut
//                 ? `${checkIn.toDateString()} - ${checkOut.toDateString()}`
//                 : 'Select check-in and check-out'}
//             </Text>
//           </TouchableOpacity>
//           <Text style={styles.label}>Guests</Text>
//           <TouchableOpacity
//             style={styles.input}
//             onPress={() => setShowDropdown(true)}
//           >
//             <Text style={styles.inputText}>
//               {`${adults} Adults • ${children} Children • ${rooms} Rooms`}
//             </Text>
//           </TouchableOpacity>

//           <Modal
//             visible={showDropdown}
//             transparent
//             animationType="slide"
//             onRequestClose={() => setShowDropdown(false)}
//           >
//             <Pressable style={guestStyles.overlay} onPress={() => setShowDropdown(false)} />
//             <View style={guestStyles.sheet}>
//               <Text style={style3.sheetTitle}>Select rooms and guests</Text>
//               <View style={guestStyles.row}>
//                 <Text>Rooms</Text>
//                 <View style={style3.counter}>
//                   <TouchableOpacity onPress={() => decrementRooms(setRooms)} style={guestStyles.roundButton}>
//                     <Text style={style3.btnText}>-</Text>
//                   </TouchableOpacity>
//                   <Text style={guestStyles.count}>{rooms}</Text>
//                   <TouchableOpacity onPress={() => incrementRooms(setRooms)} style={guestStyles.roundButton}>
//                     <Text style={style3.btnText}>+</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>

//               {/* Adults */}
//               <View style={style3.row}>
//                 <Text>Adults</Text>
//                 <View style={style3.counter}>
//                   <TouchableOpacity onPress={() => decrement(setAdults)} style={style3.roundButton}>
//                     <Text style={style3.btnText}>-</Text>
//                   </TouchableOpacity>
//                   <Text style={style3.count}>{adults}</Text>
//                   <TouchableOpacity onPress={() => increment(setAdults)} style={style3.roundButton}>
//                     <Text style={style3.btnText}>+</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>

//               {/* Children */}
//               <View style={style3.row}>
//                 <Text>Children</Text>
//                 <View style={style3.counter}>
//                   <TouchableOpacity onPress={() => decrement(setChildren)} style={style3.roundButton}>
//                     <Text style={style3.btnText}>-</Text>
//                   </TouchableOpacity>
//                   <Text style={style3.count}>{children}</Text>
//                   <TouchableOpacity onPress={() => increment(setChildren)} style={style3.roundButton}>
//                     <Text style={style3.btnText}>+</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>

//               {/* Apply Button */}
//               <TouchableOpacity style={style3.applyButton} onPress={() => setShowDropdown(false)}>
//                 <Text style={style3.applyText}>Apply</Text>
//               </TouchableOpacity>
//             </View>
//           </Modal>
//           <TouchableOpacity onPress={handleHotelSearchSubmit} style={styles.searchButton}>
//             <Text style={styles.searchButtonText}>Search</Text>
//           </TouchableOpacity>
//           <Modal visible={showHotelPopup} animationType="slide" onRequestClose={() => setShowHotelPopup(false)}>
//             <View style={styles.modalContainer}>
//               <View style={styles.modalHeader}>
//                 <TouchableOpacity onPress={() => setShowHotelPopup(false)}>
//                   <Text style={styles.closeText}>←</Text>
//                 </TouchableOpacity>
//                 <Text style={styles.modalTitle}>Select Location</Text>
//               </View>
//               <TextInput
//                 style={styles.modalInput}
//                 placeholder="Type to search..."
//                 placeholderTextColor="#666"
//                 value={hotelSearchQuery}
//                 onChangeText={setHotelSearchQuery}
//                 autoFocus
//               />
//               <FlatList
//                 data={hotelfiltered}
//                 keyExtractor={(item) => item}
//                 renderItem={({ item }) => (
//                   <TouchableOpacity
//                     style={styles.suggestionItem}
//                     onPress={() => handleHotelSelect(item)}
//                   >
//                     <Text style={styles.suggestionText}>{item}</Text>
//                   </TouchableOpacity>
//                 )}
//                 ListEmptyComponent={
//                   <Text style={styles.noResult}>No locations found</Text>
//                 }
//               />
//             </View>
//           </Modal>
//         </View>
//       );
//     } else if (activeTab === 'packages') {
//       return (
//         <View style={styles.searchBox}>
//           <Text style={styles.title}>Explore Packages</Text>

//           {/* LOCATION FIELD */}
//           <Text style={styles.label}>Location</Text>
//           <TouchableOpacity onPress={() => setShowPopup(true)}>
//             <TextInput
//               style={styles.input}
//               placeholder="Select location"
//               placeholderTextColor="#666"
//               value={location}
//               editable={false}
//             />
//           </TouchableOpacity>

//           {/* PACKAGE FIELD */}
//           <Text style={styles.label}>Date</Text>
//           <TouchableOpacity style={styles.input} onPress={() => setShowPackageDatePicker(true)}>
//             <Text style={{ color: selectedTourDate ? '#000' : '#666' }}>
//               {selectedTourDate
//                 ? `${selectedTourDate.toDateString()}`
//                 // ? `${checkIn.toDateString()} - ${checkOut.toDateString()}`
//                 : 'Select Tour Date'}
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.searchButton} onPress={handleTourPackage}>
//             <Text style={styles.searchButtonText}>Search</Text>
//           </TouchableOpacity>
//           {/* FULL-SCREEN MODAL */}
//           <Modal visible={showPopup} animationType="slide" onRequestClose={() => setShowPopup(false)}>
//             <View style={styles.modalContainer}>
//               <View style={styles.modalHeader}>
//                 <TouchableOpacity onPress={() => setShowPopup(false)}>
//                   <Text style={styles.closeText}>←</Text>
//                 </TouchableOpacity>
//                 <Text style={styles.modalTitle}>Select Location</Text>
//               </View>
//               <TextInput
//                 style={styles.modalInput}
//                 placeholder="Type to search..."
//                 placeholderTextColor="#666"
//                 value={searchQuery}
//                 onChangeText={setSearchQuery}
//                 autoFocus
//               />
//               <FlatList
//                 data={filtered}
//                 keyExtractor={(item) => item}
//                 renderItem={({ item }) => (
//                   <TouchableOpacity
//                     style={styles.suggestionItem}
//                     onPress={() => handleSelect(item)}
//                   >
//                     <Text style={styles.suggestionText}>{item}</Text>
//                   </TouchableOpacity>
//                 )}
//                 ListEmptyComponent={
//                   <Text style={styles.noResult}>No locations found</Text>
//                 }
//               />
//             </View>
//           </Modal>
//         </View>

//       );
//     } else if (activeTab === 'cars') {
//       return (
//         <View style={styles.searchBox}>
//           <Text style={styles.title}>Rent a Car</Text>
//           <Text style={styles.label}>Location</Text>
//           <TouchableOpacity onPress={() => setShowCarPopup(true)}>
//             <TextInput
//               style={styles.input}
//               placeholder="Select location"
//               placeholderTextColor="#666"
//               value={carLocation}
//               editable={false}
//             />
//           </TouchableOpacity>
//           <Text style={styles.label}>Date</Text>
//           <TouchableOpacity style={styles.input} onPress={() => setShowCarPackageDatePicker(true)}>
//             <Text style={{ color: selectedCarDate ? '#000' : '#666' }}>
//               {selectedCarDate
//                 ? `${selectedCarDate.toDateString()}`
//                 // ? `${checkIn.toDateString()} - ${checkOut.toDateString()}`
//                 : 'Select Date'}
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.searchButton} onPress={handleCarPackage}>
//             <Text style={styles.searchButtonText}>Search</Text>
//           </TouchableOpacity>
//           <Modal visible={showcarPopup} animationType="slide" onRequestClose={() => setShowCarPopup(false)}>
//             <View style={styles.modalContainer}>
//               <View style={styles.modalHeader}>
//                 <TouchableOpacity onPress={() => setShowCarPopup(false)}>
//                   <Text style={styles.closeText}>←</Text>
//                 </TouchableOpacity>
//                 <Text style={styles.modalTitle}>Select Location</Text>
//               </View>
//               <TextInput
//                 style={styles.modalInput}
//                 placeholder="Type to search..."
//                 placeholderTextColor="#666"
//                 value={carsearchQuery}
//                 onChangeText={setCarSearchQuery}
//                 autoFocus
//               />
//               <FlatList
//                 data={carFiltered}
//                 keyExtractor={(item) => item}
//                 renderItem={({ item }) => (
//                   <TouchableOpacity
//                     style={styles.suggestionItem}
//                     onPress={() => handleCarSelect(item)}
//                   >
//                     <Text style={styles.suggestionText}>{item}</Text>
//                   </TouchableOpacity>
//                 )}
//                 ListEmptyComponent={
//                   <Text style={styles.noResult}>No locations found</Text>
//                 }
//               />
//             </View>
//           </Modal>
//         </View>
//       );
//     }
//   };

//   return (
//     <ScrollView style={styles.container} contentContainerStyle={styles.innerContainer}>
//       <View style={styles.banner}>
//         <Text style={styles.bannerTitle}>Ino Travels</Text>
//         <View style={styles.tabRow}>

//           <TabButton icon="box-open" label="Package" onPress={() => setActiveTab('packages')} isActive={activeTab === 'packages'} />
//           <TabButton icon="hotel" label="Hotels" onPress={() => setActiveTab('hotels')} isActive={activeTab === 'hotels'} />
//           <TabButton icon="car" label="Cars" onPress={() => setActiveTab('cars')} isActive={activeTab === 'cars'} />

//         </View>
//       </View>

//       {renderSearchBox()}
//       {renderRecentSearch()}


//       <DatePickerModal
//         locale="en"
//         mode="range"
//         visible={showPicker}
//         label="Select check-in and check-out date" // 👈 custom label
//         onDismiss={() => setShowPicker(false)}
//         startDate={range.startDate}
//         endDate={range.endDate}
//         onConfirm={onConfirm}
//         calendarTheme={{
//           colors: {
//             surfaceVariant: '#bbdefb',  // Solid light blue
//             onSurfaceVariant: '#1976D2', // Optional: text color inside
//           },
//         }}
//       />
//       <DatePickerModal
//         locale="en"
//         mode="single"
//         visible={showPackageDatePicker}
//         label="Select Travel Date"
//         onDismiss={() => setShowPackageDatePicker(false)}
//         date={selectedTourDate}
//         onConfirm={(date) => {
//           console.log(date)
//           setSelectedTourDate(date.date);
//           setShowPackageDatePicker(false);
//         }}
//         calendarTheme={{
//           colors: {
//             surfaceVariant: '#bbdefb',  // Solid light blue
//             onSurfaceVariant: '#1976D2', // Optional: text color inside
//           },
//         }}
//       />
//       <DatePickerModal
//         locale="en"
//         mode="single"
//         visible={showcarPackageDatePicker}
//         label="Select Travel Date"
//         onDismiss={() => setShowCarPackageDatePicker(false)}
//         date={selectedTourDate}
//         onConfirm={(date) => {
//           console.log(date)
//           setSelectedCarDate(date.date);
//           setShowCarPackageDatePicker(false);
//         }}
//         calendarTheme={{
//           colors: {
//             surfaceVariant: '#bbdefb',  // Solid light blue
//             onSurfaceVariant: '#1976D2', // Optional: text color inside
//           },
//         }}
//       />

//     </ScrollView>
//   );
// };

// const style3 = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },

//   input: {
//     padding: 12,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//     margin: 10,
//   },
//   inputText: {
//     fontSize: 16,
//   },

//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },

//   sheet: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 16,
//     borderTopRightRadius: 16,
//     paddingHorizontal: 20,
//     paddingTop: 20,
//     paddingBottom: 40,
//     position: 'absolute',
//     bottom: 0,
//     width: '100%',
//   },

//   sheetTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },

//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },

//   counter: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   roundButton: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: '#E5E7EB',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   btnText: {
//     color: '#555',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },

//   count: {
//     fontSize: 16,
//     marginHorizontal: 12,
//     minWidth: 20,
//     textAlign: 'center',
//   },

//   applyButton: {
//     backgroundColor: '#0077CC',
//     paddingVertical: 14,
//     borderRadius: 8,
//     marginTop: 20,
//   },

//   applyText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
// });

// const guestStyles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   sheet: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 16,
//     borderTopRightRadius: 16,
//     paddingHorizontal: 20,
//     paddingTop: 20,
//     paddingBottom: 40,
//     position: 'absolute',
//     bottom: 0,
//     width: '100%',
//   },
//   sheetTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   counter: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   roundButton: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: '#E5E7EB',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   btnText: {
//     color: '#555',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   count: {
//     fontSize: 16,
//     marginHorizontal: 12,
//     minWidth: 20,
//     textAlign: 'center',
//   },
//   applyButton: {
//     backgroundColor: '#0077CC',
//     paddingVertical: 14,
//     borderRadius: 8,
//     marginTop: 20,
//   },
//   applyText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
// });


// // 👇 Main UI Styles
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },
//   innerContainer: { alignItems: "center", paddingBottom: 50 },
//   banner: {
//     height: height * 0.14,
//     width: "100%",
//     backgroundColor: "#2196F3",
//     justifyContent: "center",
//     paddingHorizontal: 20,
//     paddingTop: 40,
//   },
//   bannerTitle: {
//     fontSize: 28,
//     fontWeight: "bold",
//     color: "#fff",
//     marginBottom: 10,
//   },
//   tabRow: { flexDirection: "row" },
//   searchBox: {
//     backgroundColor: "#fff",
//     width: "90%",
//     borderRadius: 16,
//     padding: 20,
//     marginTop: 20,
//     elevation: 5,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 20,
//     color: "#000",
//   },
//   label: {
//     fontWeight: "600",
//     marginTop: 10,
//     color: "#333",
//   },
//   input: {
//     borderColor: "#ddd",
//     borderWidth: 1,
//     borderRadius: 12,
//     padding: 12,
//     marginTop: 5,
//     fontSize: 16,
//     color: "#000",
//   },
//   searchButton: {
//     marginTop: 20,
//     backgroundColor: "#1976D2",
//     borderRadius: 12,
//     paddingVertical: 14,
//     alignItems: "center",
//   },
//   searchButtonText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 16,
//   },

//   modalContainer: { flex: 1, backgroundColor: "#fff", paddingTop: 40 },
//   modalHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     marginBottom: 10,
//   },
//   closeText: { color: "#000", fontSize: 24, marginRight: 20 },
//   modalTitle: { fontSize: 20, fontWeight: "bold" },
//   modalInput: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     padding: 12,
//     marginHorizontal: 20,
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   suggestionItem: {
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: "#eee",
//     marginHorizontal: 20,
//   },
//   suggestionText: { fontSize: 16 },
//   noResult: {
//     textAlign: "center",
//     marginTop: 20,
//     color: "#999",
//     fontSize: 16,
//   },
// });


// export default Mainpage;
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
  Modal,
  FlatList,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import TabButton from "./MainPageComponents/TabButton";
import { DatePickerModal } from 'react-native-paper-dates';
import { useDispatch, useSelector } from 'react-redux';
import { getLocations, searchHotels } from '../Redux/hotelSlice';
import { useNavigation } from "@react-navigation/native";
import Toast from 'react-native-root-toast';
import { getDestinations, getPackages } from '../Redux/carPackageSlice';
import * as SecureStore from "expo-secure-store";
import { getTourPackages } from '../Redux/tourPackageSlice';
import HotelRecentSearch from "../MainComponents/RecentSearchComponents/HotelRecentSearch";
import CarRecentSearch from '../MainComponents/RecentSearchComponents/CarRecentSearch';
import TourRecentSearch from '../MainComponents/RecentSearchComponents/TourRecentSearch';

const { height } = Dimensions.get('window');

const formattedDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "NOT_VALID";
  date.setDate(date.getDate() + 1);
  const formattedDate = date.toISOString().split("T")[0];
  return formattedDate;
};

const Mainpage = () => {
  const { tourDetails } = useSelector((state) => state.tour);
  const { packages } = useSelector((state) => state.car);
  const { searchResults, loading } = useSelector((state) => state.hotel);

  const [location, setLocation] = useState('');
  const [guests, setGuests] = useState('2 Adults • 1 Room');
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [activeTab, setActiveTab] = useState('hotels');
  const [showPicker, setShowPicker] = useState(false);
  const [currentStep, setCurrentStep] = useState('checkIn');
  const [packageType, setPackageType] = useState('');
  const [carDate, setCarDate] = useState(null);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState('');
  const navigation = useNavigation();
  const [locations, setLocations] = useState([]);
  const [inputWidth, setInputWidth] = useState(0);
  const [hotelSearchQuery, setHotelSearchQuery] = useState("");

  // guests
  const [showDropdown, setShowDropdown] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);

  const incrementRooms = (setter) => setter((prev) => Math.min(prev + 1, 5));
  const decrementRooms = (setter) => setter((prev) => Math.max(prev - 1, 1));

  const increment = (setter) => setter((prev) => Math.min(prev + 1, 20));
  const decrement = (setter) => setter((prev) => Math.max(prev - 1, 1));

  const dispatch = useDispatch();

  // Date range for hotels
  const [range, setRange] = useState({ startDate: undefined, endDate: undefined });

  // tour
  const [dest, setDest] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPackageDatePicker, setShowPackageDatePicker] = useState(false);
  const [selectedTourDate, setSelectedTourDate] = useState(undefined);

  // car Package
  const [cardest, setCarDest] = useState([]);
  const [carLocation, setCarLocation] = useState("");
  const [showcarPopup, setShowCarPopup] = useState(false);
  const [carsearchQuery, setCarSearchQuery] = useState("");
  const [showcarPackageDatePicker, setShowCarPackageDatePicker] = useState(false);
  const [showHotelPopup, setShowHotelPopup] = useState(false);
  const [selectedCarDate, setSelectedCarDate] = useState(undefined);
  const { destinations } = useSelector((state) => state.car);

  useEffect(() => {
    dispatch(getDestinations());
  }, [dispatch]);

  useEffect(() => {
    if (destinations?.length) {
      const processedDestinations = [
        ...new Set(
          destinations.flatMap((item) =>
            item.split(",").map((part) => part.trim())
          )
        ),
      ];
      setDest(processedDestinations);
    }
  }, [destinations]);

  const onConfirm = (params) => {
    setShowPicker(false);
    setCheckIn(params.startDate);
    setCheckOut(params.endDate);
  };

  const job = async () => {
    const data = await dispatch(getLocations());
    setLocations(data.payload.data);
  };

  useEffect(() => {
    job();
  }, []);

  const handleHotelSelect = (item) => {
    setSelected(item);
    setShowHotelPopup(false);
    setHotelSearchQuery("");
  };

  const handleHotelSearchSubmit = () => {
    const startDate = formattedDate(checkIn);
    const endDate = formattedDate(checkOut);
    if (selected === '') {
      let toast = Toast.show("Select any location", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
      });
      setTimeout(() => Toast.hide(toast), 2000);
    } else if (!startDate || startDate === '1970-01-01' || startDate === null || !endDate || endDate === '1970-01-01' || endDate === null) {
      let toast = Toast.show("Please Select Start date and End Date!", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
      });
      setTimeout(() => Toast.hide(toast), 2000);
    } else {
      const total = adults + children;
      const myData = {
        location: selected,
        startDate,
        endDate,
        rooms,
        total,
        adults,
        children
      };
      navigation.navigate("searchpage", { myData });
    }
  };

  const hotelfiltered = locations.filter((item) =>
    item.toLowerCase().includes(hotelSearchQuery.toLowerCase())
  );

  // tour
  const filtered = dest.filter((item) =>
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (item) => {
    setLocation(item);
    setShowPopup(false);
    setSearchQuery("");
  };

  const formatToDDMMYYYY = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (isNaN(date)) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleTourPackage = async () => {
    const date = formatToDDMMYYYY(selectedTourDate);
    if (!selectedTourDate || selectedTourDate === '1970-01-01' || selectedTourDate === null || !date || date === '1970-01-01' || date === null) {
      let toast = Toast.show("Please Select Tour Date!", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
      });
      setTimeout(() => Toast.hide(toast), 2000);
      return;
    } else if (!location || location === '' || location === null) {
      let toast = Toast.show("Please Select the Location!", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
      });
      setTimeout(() => Toast.hide(toast), 2000);
      return;
    } else {
      const myData = {
        location,
        travelDate: date,
      };
      navigation.navigate("toursearch", { myData });
    }
  };

  const handleCarPackage = async () => {
    const date = formatToDDMMYYYY(selectedCarDate);
    if (!selectedCarDate || selectedCarDate === '1970-01-01' || selectedCarDate === null || !date || date === '1970-01-01' || date === null) {
      let toast = Toast.show("Please Select Date!", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
      });
      setTimeout(() => Toast.hide(toast), 2000);
      return;
    } else if (!carLocation || carLocation === '' || carLocation === null) {
      let toast = Toast.show("Please Select the Location!", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
      });
      setTimeout(() => Toast.hide(toast), 2000);
      return;
    } else {
      const myData = {
        location: carLocation,
        travelDate: date,
      };
      navigation.navigate("carPackageSearch", { myData });
    }
  };

  // car
  const handleCarSelect = (item) => {
    setCarLocation(item);
    setShowCarPopup(false);
    setCarSearchQuery("");
  };

  const carFiltered = dest.filter((item) =>
    item.toLowerCase().includes(carsearchQuery.toLowerCase())
  );

  useEffect(() => {
    const job = async () => {
      if (activeTab === 'hotels') {
        const hotelString = await SecureStore.getItemAsync("hotelSearchroute");
        const hotel = hotelString ? JSON.parse(hotelString) : null;
        if (hotel) {
          dispatch(
            searchHotels({
              location: hotel.location,
              checkIn: hotel.startDate,
              checkOut: hotel.endDate,
              requiredRoomCount: hotel.rooms,
              page: 0,
              size: 10,
            })
          );
        }
      } else if (activeTab === 'packages') {
        const packagesString = await SecureStore.getItemAsync("tourSearchroute");
        const packages = packagesString ? JSON.parse(packagesString) : null;
        if (packages) {
          const [day, month, year] = packages.travelDate.split("-");
          dispatch(getTourPackages({ area: packages.location, month: month }));
        }
      } else if (activeTab === 'cars') {
        const carsString = await SecureStore.getItemAsync("carSearchroute");
        const cars = carsString ? JSON.parse(carsString) : null;
        if (cars) {
          const [day, month, year] = cars.travelDate.split("-");
          dispatch(getPackages({ area: cars.location, month: month }));
        }
      }
    };
    job();
  }, [activeTab]);

  const renderRecentSearch = () => {
    if (activeTab === 'hotels') {
      return <HotelRecentSearch />;
    } else if (activeTab === 'cars') {
      return <CarRecentSearch />;
    } else if (activeTab === 'packages') {
      return <TourRecentSearch />;
    }
  };

  // ANIMATION (optional: just for title fade/slide)
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 40],
      [1, 0],
      Extrapolate.CLAMP
    );
    const translateY = interpolate(
      scrollY.value,
      [0, 40],
      [0, -20],
      Extrapolate.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const renderSearchBox = () => {
    if (activeTab === 'hotels') {
      return (
        <View style={styles.searchBox}>
          <Text style={styles.title}>Find Your Perfect Stay</Text>
          <Text style={styles.label}>Location</Text>
          <TouchableOpacity onPress={() => setShowHotelPopup(true)}>
            <TextInput
              style={styles.input}
              placeholder="Select location"
              placeholderTextColor="#666"
              value={selected}
              editable={false}
            />
          </TouchableOpacity>
          <Text style={styles.label}>Dates</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)}>
            <Text style={{ color: checkIn && checkOut ? '#000' : '#666' }}>
              {checkIn && checkOut
                ? `${checkIn.toDateString()} - ${checkOut.toDateString()}`
                : 'Select check-in and check-out'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.label}>Guests</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDropdown(true)}
          >
            <Text style={styles.inputText}>
              {`${adults} Adults • ${children} Children • ${rooms} Rooms`}
            </Text>
          </TouchableOpacity>

          <Modal
            visible={showDropdown}
            transparent
            animationType="slide"
            onRequestClose={() => setShowDropdown(false)}
          >
            <Pressable style={guestStyles.overlay} onPress={() => setShowDropdown(false)} />
            <View style={guestStyles.sheet}>
              <Text style={style3.sheetTitle}>Select rooms and guests</Text>

              <View style={guestStyles.row}>
                <Text>Rooms</Text>
                <View style={style3.counter}>
                  <TouchableOpacity onPress={() => decrementRooms(setRooms)} style={guestStyles.roundButton}>
                    <Text style={style3.btnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={guestStyles.count}>{rooms}</Text>
                  <TouchableOpacity onPress={() => incrementRooms(setRooms)} style={guestStyles.roundButton}>
                    <Text style={style3.btnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={style3.row}>
                <Text>Adults</Text>
                <View style={style3.counter}>
                  <TouchableOpacity onPress={() => decrement(setAdults)} style={style3.roundButton}>
                    <Text style={style3.btnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={style3.count}>{adults}</Text>
                  <TouchableOpacity onPress={() => increment(setAdults)} style={style3.roundButton}>
                    <Text style={style3.btnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={style3.row}>
                <Text>Children</Text>
                <View style={style3.counter}>
                  <TouchableOpacity onPress={() => decrement(setChildren)} style={style3.roundButton}>
                    <Text style={style3.btnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={style3.count}>{children}</Text>
                  <TouchableOpacity onPress={() => increment(setChildren)} style={style3.roundButton}>
                    <Text style={style3.btnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={style3.applyButton} onPress={() => setShowDropdown(false)}>
                <Text style={style3.applyText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </Modal>

          <TouchableOpacity onPress={handleHotelSearchSubmit} style={styles.searchButton}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>

          <Modal visible={showHotelPopup} animationType="slide" onRequestClose={() => setShowHotelPopup(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowHotelPopup(false)}>
                  <Text style={styles.closeText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Location</Text>
              </View>
              <TextInput
                style={styles.modalInput}
                placeholder="Type to search..."
                placeholderTextColor="#666"
                value={hotelSearchQuery}
                onChangeText={setHotelSearchQuery}
                autoFocus
              />
              <FlatList
                data={hotelfiltered}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() => handleHotelSelect(item)}
                  >
                    <Text style={styles.suggestionText}>{item}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.noResult}>No locations found</Text>
                }
              />
            </View>
          </Modal>
        </View>
      );
    } else if (activeTab === 'packages') {
      return (
        <View style={styles.searchBox}>
          <Text style={styles.title}>Explore Packages</Text>

          <Text style={styles.label}>Location</Text>
          <TouchableOpacity onPress={() => setShowPopup(true)}>
            <TextInput
              style={styles.input}
              placeholder="Select location"
              placeholderTextColor="#666"
              value={location}
              editable={false}
            />
          </TouchableOpacity>

          <Text style={styles.label}>Date</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowPackageDatePicker(true)}>
            <Text style={{ color: selectedTourDate ? '#000' : '#666' }}>
              {selectedTourDate
                ? `${selectedTourDate.toDateString()}`
                : 'Select Tour Date'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.searchButton} onPress={handleTourPackage}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>

          <Modal visible={showPopup} animationType="slide" onRequestClose={() => setShowPopup(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowPopup(false)}>
                  <Text style={styles.closeText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Location</Text>
              </View>
              <TextInput
                style={styles.modalInput}
                placeholder="Type to search..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              <FlatList
                data={filtered}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() => handleSelect(item)}
                  >
                    <Text style={styles.suggestionText}>{item}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.noResult}>No locations found</Text>
                }
              />
            </View>
          </Modal>
        </View>
      );
    } else if (activeTab === 'cars') {
      return (
        <View style={styles.searchBox}>
          <Text style={styles.title}>Rent a Car</Text>
          <Text style={styles.label}>Location</Text>
          <TouchableOpacity onPress={() => setShowCarPopup(true)}>
            <TextInput
              style={styles.input}
              placeholder="Select location"
              placeholderTextColor="#666"
              value={carLocation}
              editable={false}
            />
          </TouchableOpacity>

          <Text style={styles.label}>Date</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowCarPackageDatePicker(true)}>
            <Text style={{ color: selectedCarDate ? '#000' : '#666' }}>
              {selectedCarDate
                ? `${selectedCarDate.toDateString()}`
                : 'Select Date'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.searchButton} onPress={handleCarPackage}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>

          <Modal visible={showcarPopup} animationType="slide" onRequestClose={() => setShowCarPopup(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowCarPopup(false)}>
                  <Text style={styles.closeText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Location</Text>
              </View>
              <TextInput
                style={styles.modalInput}
                placeholder="Type to search..."
                placeholderTextColor="#666"
                value={carsearchQuery}
                onChangeText={setCarSearchQuery}
                autoFocus
              />
              <FlatList
                data={carFiltered}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() => handleCarSelect(item)}
                  >
                    <Text style={styles.suggestionText}>{item}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.noResult}>No locations found</Text>
                }
              />
            </View>
          </Modal>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Sticky banner (title + tabs) */}
      <View style={styles.banner}>
        {/* <Animated.View style={titleAnimatedStyle}> */}
          <Text style={styles.bannerTitle}>Ino Travels</Text>
        {/* </Animated.View> */}
        <View style={styles.tabRow}>
          <TabButton
            icon="box-open"
            label="Package"
            onPress={() => setActiveTab('packages')}
            isActive={activeTab === 'packages'}
          />
          <TabButton
            icon="hotel"
            label="Hotels"
            onPress={() => setActiveTab('hotels')}
            isActive={activeTab === 'hotels'}
          />
          <TabButton
            icon="car"
            label="Cars"
            onPress={() => setActiveTab('cars')}
            isActive={activeTab === 'cars'}
          />
        </View>
      </View>

      {/* Scrollable content UNDER the sticky banner */}
      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.innerContainer}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {renderSearchBox()}
        {renderRecentSearch()}

        <DatePickerModal
          locale="en"
          mode="range"
          visible={showPicker}
          label="Select check-in and check-out date"
          onDismiss={() => setShowPicker(false)}
          startDate={range.startDate}
          endDate={range.endDate}
          onConfirm={onConfirm}
          calendarTheme={{
            colors: {
              surfaceVariant: '#bbdefb',
              onSurfaceVariant: '#1976D2',
            },
          }}
        />

        <DatePickerModal
          locale="en"
          mode="single"
          visible={showPackageDatePicker}
          label="Select Travel Date"
          onDismiss={() => setShowPackageDatePicker(false)}
          date={selectedTourDate}
          onConfirm={(date) => {
            setSelectedTourDate(date.date);
            setShowPackageDatePicker(false);
          }}
          calendarTheme={{
            colors: {
              surfaceVariant: '#bbdefb',
              onSurfaceVariant: '#1976D2',
            },
          }}
        />

        <DatePickerModal
          locale="en"
          mode="single"
          visible={showcarPackageDatePicker}
          label="Select Travel Date"
          onDismiss={() => setShowCarPackageDatePicker(false)}
          date={selectedCarDate}
          onConfirm={(date) => {
            setSelectedCarDate(date.date);
            setShowCarPackageDatePicker(false);
          }}
          calendarTheme={{
            colors: {
              surfaceVariant: '#bbdefb',
              onSurfaceVariant: '#1976D2',
            },
          }}
        />
      </Animated.ScrollView>
    </View>
  );
};

const style3 = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    margin: 10,
  },
  inputText: {
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roundButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#555',
    fontSize: 18,
    fontWeight: 'bold',
  },
  count: {
    fontSize: 16,
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  applyButton: {
    backgroundColor: '#0077CC',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
  },
  applyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

const guestStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roundButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#555',
    fontSize: 18,
    fontWeight: 'bold',
  },
  count: {
    fontSize: 16,
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  applyButton: {
    backgroundColor: '#0077CC',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
  },
  applyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

// Main UI Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scroll: {
    flex: 1,
  },
  innerContainer: {
    alignItems: "center",
    paddingBottom: 50,
  },
  banner: {
    height: height * 0.14,
    width: "100%",
    backgroundColor: "#2196F3",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 10,
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  tabRow: {
    flexDirection: "row",
  },
  searchBox: {
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000",
  },
  label: {
    fontWeight: "600",
    marginTop: 10,
    color: "#333",
  },
  input: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 5,
    fontSize: 16,
    color: "#000",
  },
  inputText: {
    fontSize: 16,
  },
  searchButton: {
    marginTop: 20,
    backgroundColor: "#1976D2",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  closeText: {
    color: "#000",
    fontSize: 24,
    marginRight: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginHorizontal: 20,
  },
  suggestionText: {
    fontSize: 16,
  },
  noResult: {
    textAlign: "center",
    marginTop: 20,
    color: "#999",
    fontSize: 16,
  },
});

export default Mainpage;
