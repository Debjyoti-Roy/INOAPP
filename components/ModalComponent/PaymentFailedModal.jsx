import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";

const PaymentFailedModal = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalContainer}>
          <View style={[styles.header, { backgroundColor: "#f59e0b" }]}>
            <Text style={styles.title}>
              <MaterialIcons name="hourglass-empty" size={22} color="#fff" />{" "}
              Payment Confirmation Pending
            </Text>
            <Text style={styles.subtitle}>
              We’ve received your payment but are waiting for confirmation.
            </Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.message}>
              The payment has been deducted successfully, but the status isn’t yet
              updated. Please check your booking after a few minutes. If it’s not
              confirmed, it will automatically refund within 5–7 business days.
            </Text>

            <TouchableOpacity style={styles.retryBtn} onPress={onClose}>
              <Text style={styles.retryText}>Okay, Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#dc2626",
    padding: 20,
    alignItems: "center",
    position: "relative",
  },
  title: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  subtitle: {
    color: "#fff",
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
  },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  content: {
    padding: 20,
    alignItems: "center",
  },
  message: {
    color: "#374151",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: "#dc2626",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 6,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default PaymentFailedModal;
