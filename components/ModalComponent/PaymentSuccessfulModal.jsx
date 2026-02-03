import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Clipboard,
} from "react-native";
import LottieView from "lottie-react-native";
import { Feather } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const PaymentSuccessfulModal = ({
  visible,
  bookingId,
  checkIn,
  checkOut,
  total,
  paidAt,
  onClose,
}) => {
  const date = new Date(paidAt);
  const formatted = date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // 👇 Animation controls
  const [showDetails, setShowDetails] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      setShowDetails(false);
      // Wait for Lottie (≈2.5 seconds)
      const timer = setTimeout(() => {
        setShowDetails(true);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.fullScreen}>
        {/* ✅ Lottie Animation */}
        <LottieView
          source={require("../../assets/Lottie/CheckMark.json")}
          autoPlay
          loop={false}
          style={styles.lottie}
        />

        {/* ✅ Animated content after Lottie */}
        {showDetails && (
          <Animated.View
            style={[
              styles.detailsWrapper,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={styles.title}>Payment Successful!</Text>
            <Text style={styles.subtitle}>
              Your booking request has been received. You’ll get a payment link
              within 24 hours — confirm within 48 hours to secure your booking.
            </Text>

            <View style={styles.detailsBox}>
              <Text style={styles.bookingLabel}>YOUR BOOKING ID</Text>
              <View style={styles.bookingRow}>
                <Text style={styles.bookingId}>{bookingId}</Text>
                <Feather
                  name="copy"
                  size={18}
                  color="#2563eb"
                  onPress={() => {
                Clipboard.setString(bookingId);
              }}
                />
              </View>

              <View style={styles.detailGroup}>
                {checkIn && (
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>Check In</Text>
                    <Text style={styles.value}>{checkIn}</Text>
                  </View>
                )}

                {checkOut && (
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>Check Out</Text>
                    <Text style={styles.value}>{checkOut}</Text>
                  </View>
                )}

                <View style={styles.detailItem}>
                  <Text style={styles.label}>Total People</Text>
                  <Text style={styles.value}>{total}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.label}>Paid On</Text>
                  <Text style={styles.value}>{formatted}</Text>
                </View>
              </View>
            </View>

            {/* ✅ Proceed Button */}
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Continue Exploring</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 80,
  },
  lottie: {
    width: 180,
    height: 180,
  },
  detailsWrapper: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#16a34a",
    marginTop: 16,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
    color: "#4b5563",
    marginHorizontal: 30,
    marginTop: 6,
  },
  detailsBox: {
    marginTop: 30,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    width: "90%",
    padding: 16,
    alignItems: "center",
  },
  bookingLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  bookingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  bookingId: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2563eb",
    marginRight: 8,
  },
  detailGroup: {
    marginTop: 20,
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  detailItem: {
    width: "48%",
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    color: "#6b7280",
  },
  value: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
    marginTop: 25,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PaymentSuccessfulModal;