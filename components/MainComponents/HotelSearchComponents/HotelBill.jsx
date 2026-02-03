import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useDispatch } from "react-redux";
import * as SecureStore from "expo-secure-store";
import { bookRooms } from "@/components/Redux/hotelSlice";
import RazorpayCheckout from 'react-native-razorpay';
import Constants from "expo-constants";
import { confirmPayment } from "@/components/Redux/paymentSlice";
import Toast from 'react-native-root-toast';
import PaymentFailedModal from './../../ModalComponent/PaymentFailedModal'
import PaymentSuccessfulModal from './../../ModalComponent/PaymentSuccessfulModal'
import Svg, { Path } from "react-native-svg";


const HotelBill = ({ route, navigation }) => {
    const dispatch = useDispatch()
    const { razorpaykey } = Constants.expoConfig.extra;
    const [bookingId, setBookingId] = useState("")
    const [razorpayId, setRazorpayId] = useState("")
    const [paidAt, setPaidAt] = useState("")
    const [showSuccess, setShowSuccess] = useState(false);
    const [showFailure, setShowFailure] = useState(false);
    const { id, bookingData2, bookingData, numberOfDays, checkIn, checkOut, total } = route.params;

    const totalAmount = bookingData.reduce(
        (acc, item) => acc + item.room.pricePerNight * item.count * (numberOfDays || 1),
        0
    );
    const advance = Math.max(499, totalAmount * 0.1);
    const remaining = totalAmount - advance;

    const handlePaymentConfirm = async (paymentId, razorpayOrderId, razorpaySignature) => {
        const token = await SecureStore.getItemAsync("token");

        const res = await dispatch(
            confirmPayment({
                token,
                razorpayPaymentId: paymentId,
                razorpayOrderId: razorpayOrderId,
                razorpaySignature: razorpaySignature,
            })
        );
        console.log(res)
        if (res.payload.status == 200 || res.payload.status == 409) {
            // console.log(res.payload.data)
            setPaidAt(res.payload.data?.paidAt)
            setShowSuccess(true)
            // setBookingModal(true)
            // console.log("SUCCESSFULL")
            let toast = Toast.show("Payment Successful", {
                duration: Toast.durations.SHORT,
                position: Toast.positions.BOTTOM,
                shadow: true,
                animation: true,
                hideOnPress: true,
                delay: 0,
            });
            setTimeout(() => Toast.hide(toast), 2000);
            // navigation.navigate("hotelsSearch");
        } else {
            // console.log("NOT SUCCESSFULL")
            // setFailModal(true)
            setShowFailure(true)
        }
    };

    const openRazorpay = async (orderId) => {
        try {
            // Fetch user data (replace this part with however you're storing it)
            const userDataString = await SecureStore.getItemAsync("userData");
            const decoded = userDataString ? JSON.parse(userDataString) : {};

            const options = {
                description: 'Hotel Booking Payment',
                currency: 'INR',
                key: razorpaykey, // or use import.meta.env.VITE_RAZORPAY_KEY if configured for RN
                amount: totalAmount * 100, // Razorpay expects amount in paise
                name: 'INO TRAVELS',
                order_id: orderId, // this should come from your backend (Razorpay order API)
                prefill: {
                    name: decoded.name || 'Guest',
                    email: decoded.email || 'guest@example.com',
                    contact: decoded.phoneNumber && decoded.phoneNumber !== "NA"
                        ? decoded.phoneNumber
                        : '',
                },
                theme: { color: '#3399cc' },
            };

            RazorpayCheckout.open(options)
                .then(async (response) => {
                    // success callback
                    console.log("Payment Success:", response);
                    await handlePaymentConfirm(
                        response.razorpay_payment_id,
                        response.razorpay_order_id,
                        response.razorpay_signature
                    );
                })
                .catch((error) => {
                    console.log("Payment Cancelled/Error:", error);
                    Toast.show("Booking not confirmed. Payment was cancelled.", {
                        duration: Toast.durations.SHORT,
                        position: Toast.positions.BOTTOM,
                    });
                });
        } catch (error) {
            console.log("Error opening Razorpay:", error);
        }
    };

    const handleBack = () => navigation.goBack();


    const handleBook = async () => {
        const token = await SecureStore.getItemAsync("token");
        const book = await dispatch(bookRooms({ hotelId: id, roomBookings: bookingData2.roomBookings, token: token }))
        if (book.payload.status == 200) {
            const data = book.payload.data;
            // console.log(data)
            setBookingId(data?.bookingGroupCode)
            setRazorpayId(data?.razorpayOrderId)
            // console.log(book.payload.data)

            await openRazorpay(data?.razorpayOrderId);
        } else if (book.payload.status == 409) {
            let toast = Toast.show("Room Not Available for selected dates!", {
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

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* HEADER */}
                {/* <View style={styles.header}>
                    <Text style={styles.headerTitle}>Booking Summary</Text>
                    <Text style={styles.headerSub}>Please review your booking details</Text>
                </View> */}
                {/* HEADER */}
                <View style={styles.header}>
                    <View style={styles.headerTopRow}>
                        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                            <Svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={22}
                                height={22}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#1e293b"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <Path d="M12 19l-7-7 7-7" />
                            </Svg>
                        </TouchableOpacity>

                        <View>
                            <Text style={styles.headerTitle}>Booking Summary</Text>
                            <Text style={styles.headerSub}>Please review your booking details</Text>
                        </View>
                    </View>
                </View>


                {/* Booking Info */}
                <View style={styles.infoBox}>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Check-in</Text>
                        <Text style={styles.infoValue}>
                            {checkIn}
                        </Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Check-out</Text>
                        <Text style={styles.infoValue}>
                            {checkOut}
                        </Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Guests</Text>
                        <Text style={styles.infoValue}>
                            {total} guests
                        </Text>
                    </View>
                </View>

                {/* Room Details */}
                <Text style={styles.sectionTitle}>Your Selection</Text>
                {bookingData.map((item, index) => {
                    const nights = numberOfDays || 1;
                    const subtotal = item.room.pricePerNight * item.count * nights;
                    return (
                        <View key={index} style={styles.roomCard}>
                            <View style={styles.roomHeader}>
                                <Text style={styles.roomName}>{item.room.name}</Text>
                                <View style={styles.priceContainer}>
                                    <Text style={styles.price}>₹{subtotal.toLocaleString()}</Text>
                                    <Text style={styles.perNight}>
                                        Total for {nights} night{nights > 1 ? "s" : ""}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.roomDetails}>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Rooms</Text>
                                    <Text style={styles.detailValue}>{item.count}</Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Max Guests</Text>
                                    <Text style={styles.detailValue}>{item.room.maxOccupancy}</Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Per Night</Text>
                                    <Text style={styles.detailValue}>
                                        ₹{item.room.pricePerNight.toLocaleString()}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    );
                })}

                {/* PRICE BREAKDOWN */}
                <Text style={styles.sectionTitle}>Price Breakdown</Text>
                <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Total Amount</Text>
                    <Text style={styles.breakdownValue}>₹{totalAmount.toLocaleString()}</Text>
                </View>
                <View style={styles.breakdownRow}>
                    <View>
                        <Text style={styles.breakdownLabel}>Pay Now</Text>
                        <Text style={styles.breakdownSub}>To Generate a Booking Request</Text>
                    </View>
                    <Text style={[styles.breakdownValue, { color: "#f97316" }]}>
                        ₹{advance.toLocaleString()}
                    </Text>
                </View>
                <View style={styles.breakdownRow}>
                    <View>
                        <Text style={styles.breakdownLabel}>Remaining Amount</Text>
                        <Text style={styles.breakdownSub}>Pay after approval</Text>
                    </View>
                    <Text style={[styles.breakdownValue, { color: "#2563eb" }]}>
                        ₹{remaining.toLocaleString()}
                    </Text>
                </View>

                {/* HIGHLIGHTED BOX */}
                <View style={styles.highlightBox}>
                    <Text style={styles.highlightText}>
                        Amount to Pay Now: ₹{advance.toLocaleString()}
                    </Text>
                </View>
            </ScrollView>

            {/* FOOTER BUTTONS */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.confirmBtn}
                    onPress={handleBook}
                >
                    <Text style={styles.confirmText}>Confirm Payment</Text>
                </TouchableOpacity>
            </View>
            <PaymentSuccessfulModal
                visible={showSuccess}
                bookingId={bookingId}
                checkIn={checkIn}
                checkOut={checkOut}
                total={total}
                paidAt={paidAt}
                onClose={() => {
                    setShowSuccess(false)
                    navigation.navigate("hotelsSearch");
                }}
            />
            <PaymentFailedModal
                visible={showFailure}
                onClose={() => {
                    setShowFailure(false)
                    navigation.navigate("hotelsSearch");
                }}
            />
        </View>
    );
};

export default HotelBill;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    scroll: { padding: 16 },
    // header: { marginBottom: 16, marginTop: 30 },
    // headerTitle: { fontSize: 22, fontWeight: "bold", color: "#1e293b" },
    // headerSub: { fontSize: 14, color: "#475569", marginTop: 4 },
    header: {
        marginBottom: 16,
        marginTop: 30,
        //   paddingHorizontal: ,
    },

    headerTopRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    backBtn: {
        //   marginRight: 10,
        padding: 6,
    },

    headerTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#1e293b",
    },

    headerSub: {
        fontSize: 14,
        color: "#475569",
        marginTop: 2,
    },

    infoBox: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#eff6ff",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    infoItem: { alignItems: "center", flex: 1 },
    infoLabel: { fontSize: 13, color: "#64748b" },
    infoValue: { fontSize: 16, fontWeight: "600", color: "#0f172a" },
    sectionTitle: { fontSize: 18, fontWeight: "600", color: "#1e293b", marginVertical: 10 },
    roomCard: {
        backgroundColor: "#f9fafb",
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        marginBottom: 12,
    },
    roomHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    roomName: { fontSize: 16, fontWeight: "600", color: "#2563eb" },
    priceContainer: { alignItems: "flex-end" },
    price: { fontSize: 18, fontWeight: "700", color: "#16a34a" },
    perNight: { fontSize: 12, color: "#64748b" },
    roomDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    detailItem: { alignItems: "center", flex: 1 },
    detailLabel: { fontSize: 13, color: "#64748b" },
    detailValue: { fontSize: 15, fontWeight: "600", color: "#0f172a" },
    breakdownRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderColor: "#e2e8f0",
    },
    breakdownLabel: { fontSize: 15, color: "#334155", fontWeight: "500" },
    breakdownValue: { fontSize: 17, fontWeight: "700", color: "#16a34a" },
    breakdownSub: { fontSize: 12, color: "#64748b" },
    highlightBox: {
        backgroundColor: "#ffedd5",
        borderWidth: 1,
        borderColor: "#fed7aa",
        borderRadius: 8,
        padding: 10,
        marginVertical: 12,
    },
    highlightText: { fontSize: 16, fontWeight: "700", color: "#c2410c" },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
        borderTopWidth: 1,
        borderColor: "#e2e8f0",
    },
    cancelBtn: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#cbd5e1",
        alignItems: "center",
        marginRight: 8,
    },
    cancelText: { color: "#334155", fontWeight: "600" },
    confirmBtn: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        backgroundColor: "#2563eb",
        alignItems: "center",
        marginLeft: 8,
    },
    confirmText: { color: "#fff", fontWeight: "700" },
});
