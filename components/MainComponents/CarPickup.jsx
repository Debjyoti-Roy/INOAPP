import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Platform,
  StatusBar,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useDispatch, useSelector } from "react-redux";
import { clearBooking, clearPickupRoutes, createPickupBooking, getPickupLocations, getPickupRoutes } from "../Redux/pickupSlice";
import { format } from "date-fns"; // For sexy date formatting
import { Ionicons } from "@expo/vector-icons"; // Included in your Expo install
import * as Location from "expo-location";
import polyline from "@mapbox/polyline";
import { Polyline } from "react-native-maps";
import CarPickupSuccessModal from './../ModalComponent/CarPickupSuccessModal'
import PaymentFailedModal from './../ModalComponent/PaymentFailedModal'
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";
import Toast from 'react-native-root-toast';
import LottieView from "lottie-react-native";
import { differenceInMinutes, parseISO } from "date-fns";



const MAX_SEATS = 6;

const CarPickup = () => {
  const navigation = useNavigation();
  const mapRef = useRef(null);
  const dispatch = useDispatch();
  const { pickupLocations, pickupRoutes, errorRoutes, bookingData, errorBooking } = useSelector((state) => state.pickup);

  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);
  const [people, setPeople] = useState(1);
  const [dateTime, setDateTime] = useState(new Date());

  // UI State
  const [showPopup, setShowPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeField, setActiveField] = useState(null);
  const [pickerMode, setPickerMode] = useState("date"); // 'date' or 'time'
  const [showPicker, setShowPicker] = useState(false);
  const [region, setRegion] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [showRoutes, setShowRoutes] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routeError, setRouteError] = useState(false)

  //Modals
  const [showSuccess, setShowSuccess] = useState(false)
  const [showFailure, setShowFailure] = useState(false)

  useEffect(() => {
    dispatch(clearPickupRoutes())
  }, [])

  useEffect(() => {
    if (errorRoutes !== null) {
      setRouteError(true)
    }
  }, [errorRoutes])



  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationError("Permission denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    })();
  }, []);

  useEffect(() => {
    if (bookingData !== null) {
      setShowSuccess(true)
    }
  }, [bookingData])
  useEffect(() => {
    if (errorBooking !== null) {
      setShowFailure(true)
    }
  }, [errorBooking])


  useEffect(() => {
    dispatch(getPickupLocations());
  }, []);

  const filtered = useMemo(() => {
    return pickupLocations?.filter((loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, pickupLocations]);

  const handleSelect = (item) => {
    const value = { id: item.id, name: item.name, lat: item.lat, lng: item.lng };
    if (activeField === "pickup") setPickup(value);
    if (activeField === "drop") setDrop(value);
    setShowPopup(false);
    setSearchQuery("");
  };

  // Improved Date/Time Handler
  const onDateTimeChange = (event, selectedDate) => {
    if (event.type === "dismissed") {
      setShowPicker(false);
      return;
    }

    const currentDate = selectedDate || dateTime;

    if (Platform.OS === "android") {
      if (pickerMode === "date") {
        setDateTime(currentDate);
        setPickerMode("time"); // Immediately show time picker after date
      } else {
        setShowPicker(false);
        setDateTime(currentDate);
        setPickerMode("date"); // Reset for next time
      }
    } else {
      // iOS handles both in one UI usually
      setDateTime(currentDate);
      setShowPicker(false);
    }
  };

  const showDatePickerUI = () => {
    setPickerMode("date");
    setShowPicker(true);
  };

  useEffect(() => {
    if (pickupRoutes?.length > 0) {
      setSelectedRoute(pickupRoutes[0]);
    }
  }, [pickupRoutes]);

  const [pickupLocationId, setPickupLocationId] = useState("")
  const [dropLocationId, setDropLocationId] = useState("")

  const checkTime = (time) => {
    const selectedTime = new Date(time); // Your dateTime variable
    const currentTime = new Date();

    const minutesDiff = differenceInMinutes(selectedTime, currentTime);

    if (minutesDiff < 60) {
      return false;
    } else {
      return true;
    }
  };

  const handleSearch = () => {
    const timeFlag = checkTime(dateTime)
    if (timeFlag) {
      setRouteError(false)
      setPickupLocationId(pickup.id)
      setDropLocationId(drop.id)
      dispatch(getPickupRoutes({ pickuplocation: pickup.id, dropuplocation: drop.id, numberofpeople: people }))
      setShowRoutes(true);
    } else {
      let toast = Toast.show("Pickup time must be after 1 hour from now!", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
      });
      setTimeout(() => Toast.hide(toast), 2000);
    }
  }
  const decodedCoordinates = useMemo(() => {
    if (!selectedRoute?.encodedPolyline) return [];

    return polyline.decode(selectedRoute.encodedPolyline).map(([lat, lng]) => ({
      latitude: lat,
      longitude: lng,
    }));
  }, [selectedRoute?.encodedPolyline]);

  useEffect(() => {
    if (selectedRoute?.encodedPolyline) {
      const coords = polyline.decode(selectedRoute.encodedPolyline).map(([lat, lng]) => ({
        latitude: lat,
        longitude: lng,
      }));

      if (coords.length > 0 && mapRef.current) {
        requestAnimationFrame(() => {
          mapRef.current.fitToCoordinates(coords, {
            edgePadding: {
              top: 80,
              right: 80,
              bottom: 380,
              left: 80,
            },
            animated: true,
          });
        });
      }
    }
  }, [selectedRoute]);
  const recenterToUser = () => {
    if (region && mapRef.current) {
      mapRef.current.animateToRegion(region, 1000);
    }
  };

  const handleBookRide = async (pickups) => {
    console.log(pickups)
    const data = {
      routeid: pickups.routeId,
      pickuplocation: pickupLocationId,
      droplocation: dropLocationId,
      pickUpTime: dateTime
    }
    // console.log(data)
    const token = await SecureStore.getItemAsync("token");
    if (token) {
      dispatch(createPickupBooking(data))
    } else {
      navigation.navigate("Profile");
      let toast = Toast.show("Please Login First!", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
      });
      setTimeout(() => Toast.hide(toast), 2000);
    }
  }

  if (!region) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={require("../../assets/Lottie/InfinityLoader.json")} // Ensure path is correct
          autoPlay
          loop
          style={styles.lottie}
        />
        {/* <Text style={styles.loadingText}>Locating you...</Text> */}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {region && (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          initialRegion={region}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={false}
          followsUserLocation={!selectedRoute}
        >
          {selectedRoute && (
            <>
              <Polyline
                coordinates={decodedCoordinates}
                strokeWidth={4}
                strokeColor="#2563eb"
              />

              {pickup && <Marker coordinate={{ latitude: pickup.lat, longitude: pickup.lng }} pinColor="#10b981" />}
              {drop && <Marker coordinate={{ latitude: drop.lat, longitude: drop.lng }} pinColor="#ef4444" />}
            </>
          )}
        </MapView>
      )}

      <View style={styles.bottomSectionWrapper}>
        <TouchableOpacity
          style={styles.gpsButton}
          onPress={recenterToUser}
          activeOpacity={0.8}
        >
          <Ionicons name="locate" size={24} color="#2563eb" />
        </TouchableOpacity>

        <View style={styles.bottomCard}>
          <View style={styles.handle} />
          {!showRoutes ? (
            <>
              <Text style={styles.greeting}>Request a Ride</Text>

              {/* LOCATION SELECTOR */}
              <View style={styles.locationContainer}>
                <View style={styles.verticalLineContainer}>
                  <Ionicons name="radio-button-on" size={16} color="#10b981" />
                  <View style={styles.line} />
                  <Ionicons name="location" size={16} color="#ef4444" />
                </View>

                <View style={styles.inputsWrapper}>
                  <TouchableOpacity
                    style={styles.locationInput}
                    onPress={() => { setActiveField("pickup"); setShowPopup(true); }}
                  >
                    <Text numberOfLines={1} style={[styles.locationText, !pickup && styles.placeholder]}>
                      {pickup ? pickup.name : "Pick-up Point"}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.divider} />
                  <TouchableOpacity
                    style={styles.locationInput}
                    onPress={() => { setActiveField("drop"); setShowPopup(true); }}
                  >
                    <Text numberOfLines={1} style={[styles.locationText, !drop && styles.placeholder]}>
                      {drop ? drop.name : "Where to?"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* CHIPS ROW */}
              <View style={styles.optionsRow}>
                {/* DATE CHIP */}
                <TouchableOpacity style={styles.optionChip} onPress={showDatePickerUI}>
                  <Ionicons name="calendar-outline" size={18} color="#2563eb" style={{ marginRight: 6 }} />
                  <Text style={styles.optionLabel}>
                    {format(dateTime, "MMM d, h:mm a")}
                  </Text>
                </TouchableOpacity>

                {/* PASSENGER CHIP */}
                <View style={styles.optionChip}>
                  <TouchableOpacity onPress={() => setPeople(Math.max(1, people - 1))}>
                    <Ionicons name="remove-circle-outline" size={24} color={people > 1 ? "#2563eb" : "#d1d5db"} />
                  </TouchableOpacity>

                  <View style={styles.passengerTextWrapper}>
                    <Ionicons name="person" size={14} color="#374151" />
                    <Text style={styles.passengerCount}>{people}</Text>
                  </View>

                  <TouchableOpacity onPress={() => setPeople(Math.min(MAX_SEATS, people + 1))}>
                    <Ionicons name="add-circle-outline" size={24} color={people < MAX_SEATS ? "#2563eb" : "#d1d5db"} />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.mainButton, (!pickup || !drop) && styles.disabledButton]}
                onPress={() => handleSearch()}
                disabled={!pickup || !drop}
              >
                <Text style={styles.mainButtonText}>Submit</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* HEADER */}
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                <TouchableOpacity
                  onPress={() => {
                    setShowRoutes(false);
                    setSelectedRoute(null);
                    dispatch(clearPickupRoutes());
                    setRouteError(false); // Reset error state
                    recenterToUser();
                  }}
                >
                  <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>

                <Text style={[styles.greeting, { marginLeft: 12 }]}>
                  {pickupRoutes?.length > 0 ? "Choose a Route" : "No Routes Found"}
                </Text>
              </View>

              {/* CONDITIONAL RENDERING: Error/Empty vs List */}
              {!pickupRoutes || pickupRoutes.length === 0 || routeError ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={60} color="#ef4444" />
                  <Text style={styles.errorTitle}>Sorry!</Text>
                  <Text style={styles.errorSub}>
                    We couldn't find any available routes for this selection.
                  </Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => setShowRoutes(false)}
                  >
                    <Text style={styles.retryButtonText}>Try another location</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {/* ROUTE LIST */}
                  {pickupRoutes.map((route) => {
                    const isSelected = selectedRoute?.routeId === route.routeId;
                    return (
                      <TouchableOpacity
                        key={route.routeId}
                        style={[styles.routeCard, isSelected && styles.routeSelected]}
                        onPress={() => setSelectedRoute(route)}
                      >
                        <Text style={styles.routeName}>{route.name}</Text>
                        <Text style={styles.routeInfo}>
                          {route.distance.toFixed(1)} km · ₹{Math.round(route.price)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                  {/* BOOK BUTTON */}
                  <TouchableOpacity
                    style={[styles.mainButton, !selectedRoute && styles.disabledButton]}
                    disabled={!selectedRoute}
                    onPress={async () => await handleBookRide(selectedRoute)}
                  >
                    <Text style={styles.mainButtonText}>Book Ride</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>
      </View>

      {showPicker && (
        <DateTimePicker
          value={dateTime}
          mode={pickerMode}
          is24Hour={false}
          display={Platform.OS === "ios" ? "datetime" : "default"}
          minimumDate={new Date()}
          onChange={onDateTimeChange}
        />
      )}

      {/* SEARCH MODAL */}
      <Modal visible={showPopup} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowPopup(false)} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#111827" />
              </TouchableOpacity>
              <TextInput
                style={styles.searchBar}
                placeholder="Search for a place..."
                placeholderTextColor="#000000"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
            </View>

            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="pin" size={18} color="#6b7280" />
                  </View>
                  <View>
                    <Text style={styles.resultName}>{item.name}</Text>
                    <Text style={styles.resultSub}>Verified Location</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
      <CarPickupSuccessModal
        visible={showSuccess}
        bookingId={bookingData?.bookingId}
        pickUpLocation={bookingData?.pickUpLocation}
        dropLocation={bookingData?.dropLocation}
        pickUpTime={bookingData?.pickUpTime}
        numberOfPeople={bookingData?.numberOfPeople}
        price={bookingData?.price}
        onClose={() => {
          setShowSuccess(false)
          dispatch(clearPickupRoutes())
          dispatch(clearBooking())
          setPickup(null)
          setDrop(null)
          setPeople(1)
          setDateTime(new Date())
          recenterToUser()
          setShowRoutes(false);
          setSelectedRoute(null);
        }}
      />
      <PaymentFailedModal
        visible={showFailure}
        onClose={() => {
          setShowFailure(false)
          dispatch(clearPickupRoutes())
          dispatch(clearBooking())
          setPickup(null)
          setDrop(null)
          setPeople(1)
          setDateTime(new Date())
          recenterToUser()
          setShowRoutes(false);
          setSelectedRoute(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  handle: {
    width: 50,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  greeting: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 20 },
  locationContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  verticalLineContainer: { alignItems: 'center', width: 24, marginRight: 12 },
  line: { width: 1, flex: 1, backgroundColor: '#cbd5e1', marginVertical: 4, borderStyle: 'dashed' },
  inputsWrapper: { flex: 1 },
  locationInput: { height: 35, justifyContent: 'center' },
  locationText: { fontSize: 16, color: '#1e293b', fontWeight: '600' },
  placeholder: { color: '#94a3b8', fontWeight: '400' },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 10 },
  optionsRow: { flexDirection: 'row', marginTop: 20, gap: 10 },
  optionChip: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: { fontWeight: '700', color: '#334155', fontSize: 13 },
  passengerTextWrapper: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 },
  passengerCount: { marginLeft: 4, fontWeight: '800', color: '#111827', fontSize: 16 },
  mainButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 25,
  },
  disabledButton: { backgroundColor: '#1976D2' },
  mainButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: '#fff' },
  modalContent: { flex: 1, paddingTop: Platform.OS === 'ios' ? 60 : 20 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 12
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 15,
    fontSize: 16,
    color: '#111827'
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  resultName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  resultSub: { fontSize: 13, color: '#64748b', marginTop: 2 },
  routeCard: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  routeSelected: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
  routeName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  routeInfo: {
    marginTop: 4,
    fontSize: 14,
    color: "#475569",
  },
  bottomSectionWrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    zIndex: 10, // Ensure it is above the MapView
  },

  // 3. THE ATTACHED GPS BUTTON
  gpsButton: {
    position: 'absolute',
    top: -70, // This pulls the button 70px above the white card
    right: 20,
    backgroundColor: '#fff',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },

  bottomCard: {
    // REMOVE 'position: absolute' and 'bottom: 0' from here
    // as it is now controlled by the bottomSectionWrapper
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },

  //loading lottie
  loadingContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  lottie: {
    width: 200,
    height: 200,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#2563eb",
    fontWeight: "600",
  },

  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginTop: 10,
  },
  errorSub: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#2563eb',
    fontWeight: '700',
    fontSize: 14,
  },

});

export default CarPickup;