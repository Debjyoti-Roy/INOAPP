import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  DeviceEventEmitter
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useDispatch } from "react-redux";
import Toast from "react-native-root-toast";
import { uploadProfileDetails, uploadProfileImage } from "../Redux/profileSlice";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";

export default function MyProfile({ route }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user } = route.params;
  const [details, setDetails] = useState(user);
  const [editedDetails, setEditedDetails] = useState({});

  const handleDetailChange = (key, value) => {
    const mappedKey = key === "phoneNumber" ? "phone" : key;

    setDetails((prev) => ({
      ...prev,
      [key]: value,
    }));

    setEditedDetails((prev) => ({
      ...prev,
      [mappedKey]: value,
    }));
  };

  const handlePhotoChange = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const newPhotoUri = result.assets[0].uri;
      const file = {
        uri: newPhotoUri,
        name: `profile_${Date.now()}.jpg`,
        type: "image/jpeg",
      };

      try {
        const token = await SecureStore.getItemAsync("token");

        const res = await dispatch(
          uploadProfileImage({ file, token })
        ).unwrap();
        let toast = Toast.show("Profile photo updated successfully!", {
          duration: Toast.durations.SHORT,
          position: Toast.positions.BOTTOM,
          shadow: true,
          animation: true,
          hideOnPress: true,
          delay: 0,
        });
        setTimeout(() => Toast.hide(toast), 2000);
        DeviceEventEmitter.emit("reFetched");
        navigation.navigate("ProfileHome");
      } catch (err) {
        console.error("Upload failed:", err);
        let toast = Toast.show("Failed to upload profile photo.", {
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
  };

  // Handles form submit
  const handleSubmit = async () => {
    if (Object.keys(editedDetails).length === 0) {
      console.log("No changes made");
      alert("No changes to update!");
      return;
    }

    try {
      const token = await SecureStore.getItemAsync("token");
      const res = await dispatch(
        uploadProfileDetails({ data: editedDetails, token: token })
      ).unwrap()
      DeviceEventEmitter.emit("reFetched");
      navigation.navigate("ProfileHome");

    } catch {
      let toast = Toast.show("Failed to upload profile detils.", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
      });
      setTimeout(() => Toast.hide(toast), 2000);
    }

    let toast = Toast.show("Profile details updated successfully!", {
      duration: Toast.durations.SHORT,
      position: Toast.positions.BOTTOM,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });

    setTimeout(() => Toast.hide(toast), 2000);
    setEditedDetails({});
  };

  return (
    <View style={styles.container}>
      {/* Top Banner */}
      <View style={styles.banner}>
        {/* <Text style={styles.bannerText}>My Profile</Text> */}
        <View style={styles.bannerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="white" // Changed to white
              strokeWidth={2.5} // Slightly thicker for better visibility
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <Path d="M12 19l-7-7 7-7"  /> 
            </Svg>
          </TouchableOpacity>
          <Text style={styles.bannerText}>My Profile</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.photoContainer}>
          <Image source={{ uri: details.imageUrl }} style={styles.profilePhoto} />

          <TouchableOpacity style={styles.editPhotoBtn} onPress={handlePhotoChange}>
            <MaterialIcons name="edit" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Editable Fields */}
        {Object.entries({
          name: "Name",
          // email: "Email",
          phoneNumber: "Phone",
          address: "Address",
        }).map(([key, label]) => (
          <View key={key} style={styles.fieldRow}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={[styles.input,{color:"#000"}]}
              value={details[key]}
              placeholder={`Enter ${label}`}
              onChangeText={(text) => handleDetailChange(key, text)}
            />
          </View>
        ))}

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9" },

  banner: {
    backgroundColor: "#2196F3",
    paddingTop: 60,
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: "center",
    elevation: 4,
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 8, // Space between arrow and text
    padding: 4,      // Increase touch target
  },
  bannerText: { color: "white", fontSize: 20, fontWeight: "bold" },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    alignItems: "stretch",
  },

  photoContainer: { alignItems: "center", marginVertical: 20 },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#2196F3",
  },
  editPhotoBtn: {
    position: "absolute",
    right: 100,
    bottom: 0,
    backgroundColor: "#1976D2",
    padding: 6,
    borderRadius: 20,
    elevation: 3,
  },
  editText: { color: "white", fontSize: 14 },

  fieldRow: { marginBottom: 15 },
  label: { fontWeight: "600", marginBottom: 6, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#fff",
    elevation: 2,
  },

  submitBtn: {
    marginTop: 25,
    backgroundColor: "#2196F3",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
  },
  submitText: { color: "white", fontSize: 18, fontWeight: "600" },
});
