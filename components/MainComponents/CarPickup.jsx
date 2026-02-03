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
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useDispatch, useSelector } from "react-redux";
import { getPickupLocations } from "../Redux/pickupSlice";

const CarPickup = () => {
  const dispatch = useDispatch();
  const { pickupLocations } = useSelector((state) => state.pickup);

  // map + form state
  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);
  const [people, setPeople] = useState(1);
  const [dateTime, setDateTime] = useState(new Date());

  // modal state
  const [showPopup, setShowPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeField, setActiveField] = useState(null); // "pickup" | "drop"
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    dispatch(getPickupLocations());
  }, []);

  const filtered = useMemo(() => {
    return pickupLocations?.filter((loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, pickupLocations]);

  const handleSelect = (item) => {
    const value = {
      name: item.name,
      lat: item.lat,
      lng: item.lng,
    };

    if (activeField === "pickup") setPickup(value);
    if (activeField === "drop") setDrop(value);

    setShowPopup(false);
    setSearchQuery("");
  };

  const handleSubmit = () => {
    console.log({
      pickup,
      drop,
      people,
      dateTime,
    });
  };

  return (
    <View style={styles.container}>
      {/* MAP */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 27.03,
          longitude: 88.26,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {pickup && (
          <Marker
            coordinate={{ latitude: pickup.lat, longitude: pickup.lng }}
            title="Pickup"
            pinColor="green"
          />
        )}
        {drop && (
          <Marker
            coordinate={{ latitude: drop.lat, longitude: drop.lng }}
            title="Drop"
            pinColor="red"
          />
        )}
      </MapView>

      {/* FORM */}
      <View style={styles.form}>
        <TouchableOpacity
          style={styles.input}
          onPress={() => {
            setActiveField("pickup");
            setShowPopup(true);
          }}
        >
          <Text style={styles.inputText}>
            {pickup ? pickup.name : "Select Pickup Location"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.input}
          onPress={() => {
            setActiveField("drop");
            setShowPopup(true);
          }}
        >
          <Text style={styles.inputText}>
            {drop ? drop.name : "Select Drop Location"}
          </Text>
        </TouchableOpacity>

        {/* PEOPLE */}
        <View style={styles.row}>
          <Text style={styles.label}>People</Text>
          <View style={styles.counter}>
            <TouchableOpacity onPress={() => setPeople(Math.max(1, people - 1))}>
              <Text style={styles.counterBtn}>−</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{people}</Text>
            <TouchableOpacity onPress={() => setPeople(people + 1)}>
              <Text style={styles.counterBtn}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* DATE TIME */}
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.inputText}>
            {dateTime.toLocaleString()}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={dateTime}
            mode="datetime"
            display={Platform.OS === "ios" ? "inline" : "default"}
            onChange={(e, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDateTime(selectedDate);
            }}
          />
        )}

        {/* SUBMIT */}
        <TouchableOpacity style={styles.submit} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </View>

      {/* LOCATION MODAL */}
      <Modal visible={showPopup} animationType="slide">
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
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.suggestionText}>{item.name}</Text>
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
};

export default CarPickup;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { height: "40%" },

  form: {
    padding: 16,
    backgroundColor: "#fff",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },

  inputText: {
    fontSize: 16,
    color: "#333",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
  },

  counter: {
    flexDirection: "row",
    alignItems: "center",
  },

  counterBtn: {
    fontSize: 22,
    width: 40,
    textAlign: "center",
  },

  counterValue: {
    fontSize: 16,
    marginHorizontal: 10,
  },

  submit: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  /* MODAL */
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
  },
});
