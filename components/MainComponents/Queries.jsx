import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  DeviceEventEmitter,
  ToastAndroid,
} from "react-native";
import React, { useEffect, useState } from "react";
import image from "../../assets/images/queryImage.jpg";
import * as SecureStore from 'expo-secure-store';
import Toast from "react-native-root-toast";
import { useDispatch } from "react-redux";
import { sendPrivateQuery, sendPublicQuery } from "../Redux/querySlice";
import Svg, { Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";

const Queries = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error2, setError2] = useState("");
  const [loggedIn, setLoggedIn] = useState(false)
  const [token, setToken] = useState("")
  const [tokenModal, setTokenModal] = useState(false)
  const [ticketId, setTicketId] = useState("");
  const [submittedOn, setSubmittedOn] = useState("");
  const [category, setCategory] = useState("");
  const [response, setResponse] = useState("");
  const [priority, setPriority] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    const handleUpdateFields = async () => {
      const storedUser = await SecureStore.getItemAsync("userData");
      const storedToken = await SecureStore.getItemAsync("token");
      if (storedUser) {
        setLoggedIn(true)
        console.log(JSON.parse(storedUser))
        const user = JSON.parse(storedUser)
        setName(user.name)
        if (user.phoneNumber !== "") {
          setContact(user.phoneNumber)
        } else {
          setContact(user.email)
        }
      } else {
        setName("")
        setContact("")
        setLoggedIn(false)
      }
      if (storedToken) {
        // console.log(storedToken)
        setToken(storedToken)
      }

    }
    handleUpdateFields()
    const subscription = DeviceEventEmitter.addListener("userDataUpdated", handleUpdateFields);

    return () => subscription.remove();
  }, [])


  const validateContact = () => {
    const phoneRegex = /^\d{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!phoneRegex.test(contact) && !emailRegex.test(contact)) {
      setError2("Enter a valid contact");
    } else {
      setError2("");
    }
  };


  const handleSubmit = async () => {
    if (!name || !contact || !subject || !message) {
      alert("Please fill all fields");
      return;
    }
    if (error2) {
      alert("Please correct errors");
      return;
    }

    //     let toast = Toast.show("Toast message", {
    //   duration: Toast.durations.SHORT,
    //   position: Toast.positions.BOTTOM,
    //   shadow: true,
    //   animation: true,
    //   hideOnPress: true,
    //   delay: 0,
    // });

    // // Optionally hide it later
    // setTimeout(() => Toast.hide(toast), 2000);
    if (loggedIn) {
      // const storedToken = await SecureStore.getItemAsync("token");
      if (token) {
        const push = await dispatch(
          sendPrivateQuery({ token, subject: subject, message: message })
        );

        if (push.payload?.status == 201) {
          setTokenModal(true)
          const ticket = push.payload?.data;
          setTicketId(ticket.ticketId);
          const rawTime = ticket.updatedAt;
          const fixedTime = rawTime.replace(/;/g, ":");
          const dateObj = new Date(fixedTime);

          // Get individual parts
          const options = { month: "short" };
          const month = new Intl.DateTimeFormat("en-US", options).format(
            dateObj
          ); // "Jul"
          const day = dateObj.getDate(); // 3
          const year = dateObj.getFullYear(); // 2025

          // Get hours and minutes with leading zeros
          const hours = dateObj.getHours().toString().padStart(2, "0");
          const minutes = dateObj.getMinutes().toString().padStart(2, "0");

          const formatted = `${month} ${day}, ${year} • ${hours}:${minutes}`;
          setSubmittedOn(formatted);
          setCategory(ticket.queryType);
          const res =
            ticket.queryType === "GENERIC"
              ? "Within 24 Hours"
              : "Within 12 Hours";
          setResponse(res);
          const pr =
            ticket.queryType === "GENERIC" ? "STANDARD" : "IMPORTANT";
          setPriority(pr);

        } else {
          alert("Error")
        }
      }
    } else {
      const push = await dispatch(
        sendPublicQuery({
          subject: subject,
          message: message,
          name: name,
          contact: contact,
        })
      );

      if (sendPublicQuery.fulfilled.match(push)) {

        setTokenModal(true);
        const ticket = push.payload?.data;
        setTicketId(ticket.ticketId);
        const rawTime = ticket.createdAt;
        const fixedTime = rawTime.replace(/;/g, ":");
        const dateObj = new Date(fixedTime);

        // Get individual parts
        const options = { month: "short" };
        const month = new Intl.DateTimeFormat("en-US", options).format(dateObj); // "Jul"
        const day = dateObj.getDate(); // 3
        const year = dateObj.getFullYear(); // 2025

        // Get hours and minutes with leading zeros
        const hours = dateObj.getHours().toString().padStart(2, "0");
        const minutes = dateObj.getMinutes().toString().padStart(2, "0");

        const formatted = `${month} ${day}, ${year} • ${hours}:${minutes}`;
        setSubmittedOn(formatted);
        setCategory(ticket.queryType);
        const res =
          ticket.queryType === "GENERIC"
            ? "Within 24 Hours"
            : "Within 12 Hours";
        setResponse(res);
        const pr = ticket.queryType === "GENERIC" ? "STANDARD" : "IMPORTANT";
        setPriority(pr);
      } else {
        alert("error")
      }
    }

  };

  const handleBack = () => navigation.goBack();

  return (
    <View style={{ flex: 1, backgroundColor: "#EFF6FF" }}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Svg
            xmlns="http://www.w3.org/2000/svg"
            width={22}
            height={22}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Path d="M12 19l-7-7 7-7" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Get in touch!</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headingWrapper}>
          <Text style={styles.subtitle}>
            Have questions about our destinations or need help planning your
            perfect trip? Our travel experts are here to help.
          </Text>
        </View>

        <View style={styles.card}>
          <Image source={image} style={styles.image} resizeMode="cover" />
          <View style={styles.form}>
            <Text style={styles.formTitle}>Send us a message</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
              />
              <View style={{ flex: 1 }}>
                <TextInput
                  style={[
                    styles.input,
                    error2 ? { borderColor: "red" } : {},
                  ]}
                  placeholder="Contact"
                  value={contact}
                  onChangeText={setContact}
                  onBlur={validateContact}
                  keyboardType="numeric"
                />
                {error2 ? <Text style={styles.error}>{error2}</Text> : null}
              </View>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Subject"
              value={subject}
              onChangeText={setSubject}
            />
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: "top" }]}
              placeholder="Message"
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Send Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Queries;

const styles = StyleSheet.create({
  topBar: {
    backgroundColor: "#2196F3",
    paddingTop: 60,
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: "center",
    elevation: 4,
    display: "flex",
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: "flex-start",
  },
  backBtn: {
    //   marginRight: 10,
    color:"white",
    padding: 6,
  },
  topBarTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  container: {
    flexGrow: 1,
    padding: 16,
    alignItems: "center",
  },
  headingWrapper: {
    width: "80%",
    marginVertical: 20,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#6B7280",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "column",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    width: "100%",
    maxWidth: 800,
  },
  image: {
    width: "100%",
    height: 200,
  },
  form: {
    padding: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "white",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});


