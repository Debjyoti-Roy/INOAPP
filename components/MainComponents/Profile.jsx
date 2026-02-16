import {
  StyleSheet,
  Text,
  View,
  Button,
  Modal,
  TextInput,
  TouchableOpacity,
  DeviceEventEmitter,
  Animated,
  Easing,
  Dimensions,
  Image
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Feather from "react-native-vector-icons/Feather";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";
import { useDispatch } from "react-redux";
import { fetchUserProfile, registerUser } from "../Redux/userSlice";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import google from "../../assets/images/GoogleIcon.png"
import { useNavigation } from "@react-navigation/native";

let refreshIntervalId = null;
export const startTokenRefresh = () => {
  if (refreshIntervalId) return;
  refreshIntervalId = setInterval(async () => {
    try {
      const current = auth().currentUser;
      if (current) {
        const newToken = await current.getIdToken(true);
        await SecureStore.setItemAsync("token", newToken);
        DeviceEventEmitter.emit("userDataUpdated");
        console.log("Token refreshed:", newToken?.substring?.(0, 20) + "...");
      } else {
        console.log("No user, skipping token refresh");
      }
    } catch (err) {
      console.error("Error refreshing token:", err);
    }
  }, 40 * 60 * 1000);
};
export const stopTokenRefresh = () => {
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
  }
};

const { height: windowHeight } = Dimensions.get("window");

const Profile = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState(false);
  const [currentuser, setCurrentUser] = useState({});
  const [initialToken, setInitialToken] = useState("");
  const [uid, setUid] = useState("")
  const isAuthenticating = useRef(false);

  const bannerHeight = useRef(new Animated.Value(windowHeight)).current;

  const menuItems = [
    { id: "profile", title: "My Profile" },
    // { id: "bookings", title: "My Bookings" },
    { id: "about", title: "About" },
    { id: "contact", title: "Contact Us" },
    { id: "partner", title: "Partner Dashboard" },
    // { id: "help", title: "Help & Center" },
    { id: "terms", title: "Terms and Condition" },
    { id: "queries", title: "My Queries" },
  ];

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "1047548149606-qnpgc3a2enbchql7h6drn264dpv5ipbg.apps.googleusercontent.com",
    });
  }, []);

  useEffect(() => {
    Animated.timing(bannerHeight, {
      toValue: user ? windowHeight * 0.6 : windowHeight,
      duration: 550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [user, bannerHeight]);
  useEffect(() => {
    const checkUserData = async () => {
      try {
        const storedUser = await SecureStore.getItemAsync("userData");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          const token = await SecureStore.getItemAsync("token");
          if (token) startTokenRefresh();
        }
      } catch (err) {
        console.error("Error reading userData:", err);
      } finally {
      }
    };
    checkUserData();
  }, []);
  function handleAuthStateChanged(firebaseUser) {
    if (isAuthenticating.current) return;
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(handleAuthStateChanged);
    return subscriber;
  }, []);
  // event call
  useEffect(() => {
    const handleEventCall = async () => {
      const token = await SecureStore.getItemAsync("token");
      const uid = await SecureStore.getItemAsync("uid");
      const action = await dispatch(
        fetchUserProfile({ uid, token })
      );
      if (fetchUserProfile.fulfilled.match(action) && action.payload?.data) {
        await SecureStore.setItemAsync(
          "userData",
          JSON.stringify(action.payload.data)
        );
        await SecureStore.setItemAsync("token", token);
        DeviceEventEmitter.emit("userDataUpdated");
        console.log(action.payload.data)
        setUser(action.payload.data);
        startTokenRefresh();
      } else {
        console.warn("No profile data received:", action.payload);
      }

    }
    handleEventCall()
    const subscription = DeviceEventEmitter.addListener("reFetched", handleEventCall);

    return () => subscription.remove();
  }, [])

  if (initializing) return null;

  const signIn = async () => {
    try {
      isAuthenticating.current = true;
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(
        response.data.idToken
      );
      const result = await auth().signInWithCredential(googleCredential);
      // setUid(result.user.uid)
      await SecureStore.setItemAsync("uid", result.user.uid);
      const token = await auth().currentUser.getIdToken();
      if (result?.additionalUserInfo?.isNewUser) {
        console.log("New user, showing phone modal...");
        setCurrentUser(result.user);
        setInitialToken(token);
        setShowPhoneModal(true);
        isAuthenticating.current = true;
      } else {
        isAuthenticating.current = false;
        const action = await dispatch(
          fetchUserProfile({ uid: result.user.uid, token })
        );
        if (fetchUserProfile.fulfilled.match(action) && action.payload?.data) {
          await SecureStore.setItemAsync(
            "userData",
            JSON.stringify(action.payload.data)
          );
          await SecureStore.setItemAsync("token", token);
          DeviceEventEmitter.emit("userDataUpdated");
          console.log(action.payload.data)
          setUser(action.payload.data);
          startTokenRefresh();
        } else {
          console.warn("No profile data received:", action.payload);
        }
      }
    } catch (err) {
      console.error("Sign-in error", err);
    } finally {
      if (!showPhoneModal) isAuthenticating.current = false;
    }
  };
  const handleSubmit = async () => {
    if (!/^\d{10}$/.test(phone)) {
      setError(true);
      return;
    }
    setError(false);

    const userData = {
      uid: currentuser.uid,
      name: currentuser.displayName || "",
      email: currentuser.email || "",
      phoneNumber: phone,
      imageUrl: currentuser.photoURL || "",
      role: "USER",
    };

    try {
      const thunkResponse = await dispatch(
        registerUser({ data: userData, token: initialToken })
      );
      if (thunkResponse.payload?.status === 201) {
        isAuthenticating.current = false;
        const current = auth().currentUser;
        const newToken = current ? await current.getIdToken(true) : initialToken;
        await SecureStore.setItemAsync(
          "userData",
          JSON.stringify(thunkResponse.payload?.data)
        );
        await SecureStore.setItemAsync("token", newToken);
        DeviceEventEmitter.emit("userDataUpdated");
        setUser(thunkResponse.payload?.data);
        setShowPhoneModal(false);
        setPhone("");
        startTokenRefresh();
      } else {
        console.warn("Profile creation failed:", thunkResponse.payload);
        await auth().signOut();
        await SecureStore.deleteItemAsync("userData");
        await SecureStore.deleteItemAsync("token");
        DeviceEventEmitter.emit("userDataUpdated");
        setUser(null);
        setShowPhoneModal(false);
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      try {
        await auth().signOut();
      } catch (e) {
        console.error("Error signing out after failed registration:", e);
      }
      await SecureStore.deleteItemAsync("userData");
      await SecureStore.deleteItemAsync("token");
      DeviceEventEmitter.emit("userDataUpdated");
      setUser(null);
      setShowPhoneModal(false);
    } finally {
      isAuthenticating.current = false;
    }
  };



  const handleSkip = async () => {
    const userData = {
      uid: currentuser.uid,
      name: currentuser.displayName || "",
      email: currentuser.email || "",
      phoneNumber: "",
      imageUrl: currentuser.photoURL || "",
      role: "USER",
    };
    try {
      const thunkResponse = await dispatch(
        registerUser({ data: userData, token: initialToken })
      );
      if (thunkResponse.payload?.status === 201) {
        isAuthenticating.current = false;
        const current = auth().currentUser;
        const newToken = current ? await current.getIdToken(true) : initialToken;
        await SecureStore.setItemAsync(
          "userData",
          JSON.stringify(thunkResponse.payload?.data)
        );
        await SecureStore.setItemAsync("token", newToken);
        DeviceEventEmitter.emit("userDataUpdated");
        setUser(thunkResponse.payload?.data);
        setShowPhoneModal(false);
        startTokenRefresh();
      } else {
        console.warn("Profile creation failed on skip:", thunkResponse.payload);
        await auth().signOut();
        await SecureStore.deleteItemAsync("userData");
        await SecureStore.deleteItemAsync("token");
        DeviceEventEmitter.emit("userDataUpdated");
        setUser(null);
        setShowPhoneModal(false);
      }
    } catch (err) {
      console.error("Error in handleSkip:", err);
      try {
        await auth().signOut();
      } catch (e) {
        console.error("Error signing out after failed skip:", e);
      }
      await SecureStore.deleteItemAsync("userData");
      await SecureStore.deleteItemAsync("token");
      DeviceEventEmitter.emit("userDataUpdated");
      setUser(null);
      setShowPhoneModal(false);
    } finally {
      isAuthenticating.current = false;
    }
  };
  const handleSignOut = async () => {
    try {
      setShowPhoneModal(false);
      isAuthenticating.current = false;
      setUser(null);
      await auth().signOut();
      stopTokenRefresh();
      await SecureStore.deleteItemAsync("userData");
      await SecureStore.deleteItemAsync("token");
      DeviceEventEmitter.emit("userDataUpdated");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.banner, { height: bannerHeight }]}>
        {user && (
          <View style={styles.avatarContainer}>
            {user.imageUrl ? (
              <Image
                source={{ uri: user.imageUrl }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>
                  {user.name
                    ? user.name
                      .split(" ")
                      .map(n => n[0])
                      .join("")
                      .toUpperCase()
                    : user.email?.[0]?.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        )}

        <Text style={styles.bannerTitle}>
          {user ? `Welcome, ${user.name || user.email}` : "Welcome"}
        </Text>
        <Text style={styles.bannerSub}>
          {user ? "Here's your dashboard" : "Sign in to continue"}
        </Text>

        {!user && (
          <TouchableOpacity style={styles.loginButton} onPress={signIn}>
            <Image source={google} style={styles.googleIcon} />
            <Text style={styles.loginText}>Sign in with Google</Text>
          </TouchableOpacity>

        )}
      </Animated.View>
      {user && (
        <>
          <View style={styles.gridContainer}>
            {menuItems.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={styles.gridItem}
                onPress={() => {
                  if (m.title === "My Profile") {
                    navigation.navigate("MyProfile", { user }); // pass user data
                  } else if (m.title === "My Queries") {
                    navigation.navigate("MyQueries"); // pass user data
                  } else if (m.title === "Contact Us") {
                    navigation.navigate("ContactUs")
                  } else {
                    console.log("Pressed", m.title);
                  }
                }}
              >
                <Text style={styles.gridText}>{m.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </>
      )}
      <Modal
        visible={showPhoneModal}
        transparent
        animationType="slide"
        onRequestClose={handleSkip}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={["#1976D2", "#63A4FF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.header}
            >
              <Text style={styles.headerTitle}>Welcome</Text>
              <Text style={styles.headerSubTitle}>Sign in to continue</Text>
            </LinearGradient>

            <View style={styles.content}>
              <View style={styles.iconWrap}>
                <Feather name="phone" size={40} color="#1976D2" />
              </View>

              <Text style={styles.contentText}>Please enter your Phone Number</Text>

              <TextInput
                style={[styles.input, error && { borderColor: "red" }]}
                placeholder="Phone Number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(t) => {
                  setPhone(t);
                  if (error) setError(false);
                }}
                maxLength={10}
              />
              {error && (
                <Text style={styles.errorText}>
                  Please enter a valid 10-digit phone number
                </Text>
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.skipButton]}
                  onPress={handleSkip}
                >
                  <Text style={styles.buttonText}>Skip</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={handleSubmit}
                >
                  <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  banner: {
    width: "100%",
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  bannerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 6,
  },
  bannerSub: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 14,
    marginBottom: 18,
  },
  loginButton: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 25,
    elevation: 4,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    resizeMode: "contain",
  },
  loginText: {
    color: "#2196F3",
    fontWeight: "600",
    fontSize: 15,
  },

  gridContainer: {
    padding: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%", // two columns
    backgroundColor: "#E3F2FD",
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  gridText: {
    color: "#0D47A1",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },

  signOutBtn: {
    backgroundColor: "#f44336",
    paddingVertical: 14,
    borderRadius: 10,
    marginHorizontal: 18,
    marginTop: 6,
    marginBottom: 22,
    alignItems: "center",
  },
  signOutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  avatarContainer: {
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1976D2",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  header: {
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  headerSubTitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  content: {
    width: "100%",
    alignItems: "center",
    padding: 20,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#63A4FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  contentText: {
    color: "#333",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#f9f9f9",
    color: "#000",
    marginBottom: 10,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  buttonRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  skipButton: {
    backgroundColor: "#9e9e9e",
  },
  submitButton: {
    backgroundColor: "#1976D2",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});

export default Profile;