import React, { useEffect, useMemo, useState } from "react";
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
import { getPickupLocations } from "../Redux/pickupSlice";
import { format } from "date-fns"; // For sexy date formatting
import { Ionicons } from "@expo/vector-icons"; // Included in your Expo install
import * as Location from "expo-location";


const MAX_SEATS = 6;

const CarPickup = () => {
  const dispatch = useDispatch();
  const { pickupLocations } = useSelector((state) => state.pickup);

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
    dispatch(getPickupLocations());
  }, []);

  const filtered = useMemo(() => {
    return pickupLocations?.filter((loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, pickupLocations]);

  const handleSelect = (item) => {
    const value = { name: item.name, lat: item.lat, lng: item.lng };
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {region && (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          region={region}
          showsUserLocation
          followsUserLocation
        >

          {pickup && <Marker coordinate={{ latitude: pickup.lat, longitude: pickup.lng }} pinColor="#10b981" />}
          {drop && <Marker coordinate={{ latitude: drop.lat, longitude: drop.lng }} pinColor="#ef4444" />}
        </MapView>
      )}


      <View style={styles.bottomCard}>
        <View style={styles.handle} />
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
          onPress={() => console.log('Booking...', { pickup, drop, people, dateTime })}
          disabled={!pickup || !drop}
        >
          <Text style={styles.mainButtonText}>Submit</Text>
        </TouchableOpacity>
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
});

export default CarPickup;