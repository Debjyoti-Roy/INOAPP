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
    Pressable,
} from "react-native";
import LottieView from "lottie-react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

const CarPickupSuccessModal = ({ visible, bookingId, pickUpLocation, dropLocation, pickUpTime, numberOfPeople, price, onClose }) => {
    const [showDetails, setShowDetails] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(15)).current;

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
            }, 2400);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    // const formattedDate = new Date(paidAt).toLocaleString("en-IN", {
    //     day: "2-digit",
    //     month: "long",
    //     year: "numeric",
    //     hour: "2-digit",
    //     minute: "2-digit",
    // });
    return (
        <Modal visible={visible} transparent={false} animationType="fade">
            <View style={styles.backdrop}>

                {/* Lottie animation */}
                <LottieView
                    source={require("../../assets/Lottie/CheckMark.json")}
                    autoPlay
                    loop={false}
                    style={styles.lottie}
                />
                {showDetails && (
                    <Animated.View
                        style={[
                            styles.modalCard,
                            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                        ]}
                    >
                        {/* BLUE HEADER */}
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>Payment Successful!</Text>
                            <Text style={styles.headerInfo}>
                                Your booking request has been received.
                            </Text>
                        </View>

                        {/* WHITE CONTENT BOX */}
                        <View style={styles.whiteBox}>
                            <Text style={styles.bookingLabel}>YOUR BOOKING ID</Text>

                            <View style={styles.bookingRow}>
                                <Text style={styles.bookingId}>{bookingId}</Text>
                                <Pressable onPress={() => Clipboard.setString(bookingId)}>
                                    <Feather name="copy" size={18} color="#2563eb" />
                                </Pressable>
                            </View>

                            {/* Divider */}
                            <View style={styles.divider} />

                            {/* GRID */}
                            <View style={styles.detailsGrid}>
                                <View style={styles.detailItem}>
                                    <Text style={styles.label}>Pickup</Text>
                                    <Text style={styles.value}>{pickUpLocation}</Text>
                                </View>

                                <View style={styles.detailItem}>
                                    <Text style={styles.label}>Drop</Text>
                                    <Text style={styles.value}>{dropLocation}</Text>
                                </View>

                                <View style={styles.detailItem}>
                                    <Text style={styles.label}>Number of People</Text>
                                    <Text style={styles.value}>{numberOfPeople}</Text>
                                </View>

                                <View style={styles.detailItem}>
                                    <Text style={styles.label}>Price</Text>
                                    <Text style={styles.value}>{price}</Text>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.button} onPress={onClose}>
                            <Text style={styles.buttonText}>Continue Exploring</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </View>
        </Modal>
    )
}

export default CarPickupSuccessModal

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 80,
    },
    lottie: {
        width: 180,
        height: 180,
        marginBottom: 0,
    },
    modalCard: {
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 12,
        overflow: "hidden",
        elevation: 0,
    },
    header: {
        // backgroundColor: "#2563eb",
        paddingVertical: 18,
        paddingHorizontal: 16,
        alignItems: "center",
        position: "relative",
    },
    headerTitle: {
        color: "#000000ff",
        fontSize: 18,
        fontWeight: "600",
    },
    headerInfo: {
        color: "#000000ff",
        fontSize: 12,
        marginTop: 6,
        textAlign: "center",
        paddingHorizontal: 10,
    },
    closeBtn: {
        position: "absolute",
        top: 8,
        right: 10,
    },
    whiteBox: {
        backgroundColor: "#eff6ff",
        alignItems: "center",
        alignSelf: "center",
        marginTop: 30,
        width: "90%",
        borderRadius: 12,
        paddingBottom: 20,
    },
    bookingLabel: {
        textAlign: "center",
        color: "#6b7280",
        fontSize: 12,
        marginTop: 12,
    },
    bookingRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
        marginTop: 6,
    },
    bookingId: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#2563eb",
        marginRight: 10,
    },
    divider: {
        height: 2,
        backgroundColor: "#bfdbfe",
        width: "85%",
        alignSelf: "center",
        marginTop: 8,
    },
    detailsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        width: "85%",
        alignSelf: "center",
        marginTop: 12,
    },
    detailItem: {
        width: "50%",
        marginBottom: 16,
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
        alignItems: "center",
        alignSelf: "center",
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