import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Clipboard,
} from "react-native";
import LottieView from "lottie-react-native";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const TourPackageSuccessModal = ({
  visible,
  bookingId,
  queryType,
  total,
  travelDate,
  numberofpeople,
  message,
  onClose,
}) => {
  // Animation Controls
  const [showDetails, setShowDetails] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      setShowDetails(false);
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

        {/* ✅ Details after animation */}
        {showDetails && (
          <Animated.View
            style={[
              styles.container,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Booking Enquiry Created</Text>
              <Text style={styles.headerMessage}>{message}</Text>

              {/* <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Ionicons name="close" size={22} color="#fff" />
              </TouchableOpacity> */}
            </View>

            {/* Booking ID Section */}
            <View style={styles.bookingContainer}>
              <Text style={styles.bookingLabel}>YOUR BOOKING ID</Text>
              <View style={styles.bookingRow}>
                <Text style={styles.bookingId}>{bookingId}</Text>
                <Feather
                  name="copy"
                  size={18}
                  color="#2563eb"
                  onPress={() => Clipboard.setString(bookingId)}
                />
              </View>

              <View style={styles.divider} />

              {/* Details Grid */}
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.label}>Travel Date</Text>
                  <Text style={styles.value}>{travelDate}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.label}>Number of People</Text>
                  <Text style={styles.value}>{numberofpeople}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.label}>Query Type</Text>
                  <Text style={styles.value}>{queryType}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.label}>Price Per Person</Text>
                  <Text style={styles.value}>{total}</Text>
                </View>
              </View>
            </View>

            {/* Continue Button */}
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Continue Exploring</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
};

export default TourPackageSuccessModal;

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
  container: {
    width: "100%",
    alignItems: "center",
  },
  header: {
    // backgroundColor: "#2563eb",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    width: "90%",
    alignItems: "center",
    paddingVertical: 16,
    position: "relative",
  },
  headerTitle: {
    fontSize: 18,
    color: "#000000ff",
    fontWeight: "600",
  },
  headerMessage: {
    color: "#000000ff",
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 16,
    marginTop: 6,
  },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 4,
  },
  bookingContainer: {
    backgroundColor: "#ffffffff",
    borderRadius: 12,
    marginTop: 16,
    width: "90%",
    paddingVertical: 16,
    alignItems: "center",
  },
  bookingLabel: {
    color: "#6b7280",
    fontSize: 12,
  },
  bookingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 8,
  },
  bookingId: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563eb",
    marginRight: 8,
  },
  divider: {
    height: 2,
    backgroundColor: "#BFDBFE",
    width: "85%",
    marginVertical: 10,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "85%",
    marginTop: 6,
  },
  detailItem: {
    width: "48%",
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: "#6b7280",
  },
  value: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
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
