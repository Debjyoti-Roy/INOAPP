import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import Svg, { Path } from "react-native-svg";
import { useDispatch, useSelector } from "react-redux";
import { bookPackage } from "@/components/Redux/carPackageSlice";
import { carPackageConfirmPayment } from "@/components/Redux/paymentSlice";
import * as SecureStore from "expo-secure-store";
import RazorpayCheckout from 'react-native-razorpay';
import Constants from "expo-constants";
import CarPackageSuccessModal from '../../ModalComponent/CarPackageSuccessModal'
import PaymentFailedModal from '../../ModalComponent/PaymentFailedModal'

const CarPackageBill = ({ route, navigation }) => {
    const { applicablePrice, carDetails, bookingData, myData } = route.params;
    const [visible, setVisible] = useState(false)
    const [paidAt, setPaidAt] = useState("")
    const [showFailure, setShowFailure] = useState(false)
    const [bookPackageData, setBookPackageData] = useState({})
    const { razorpaykey } = Constants.expoConfig.extra;
    const dispatch = useDispatch()
    // const {
    //     bookPackageData,
    // } = useSelector((state) => state.car);

    const price = bookingData?.applicablePrice?.price || 0;
    const payNow = Math.max(499, price * 0.1);
    const remaining = price - payNow;

    const handlePaymentConfirm = async (paymentId, razorpayOrderId, razorpaySignature) => {
        const token = await SecureStore.getItemAsync("token");
        const res = await dispatch(
            carPackageConfirmPayment({
                token,
                razorpayPaymentId: paymentId,
                razorpayOrderId: razorpayOrderId,
                razorpaySignature: razorpaySignature,
            })
        );

        if (res.payload.status == 200 || res.payload.status == 409) {
            setPaidAt(res.payload.data?.paidAt)
            setVisible(true)

        } else {
            setShowFailure(true)
        }
    };


    const openRazorpay = async (packageData) => {
        try {
            const userDataString = await SecureStore.getItemAsync("userData");
            const decoded = userDataString ? JSON.parse(userDataString) : {};

            const options = {
                description: 'Car Package Booking Payment',
                currency: 'INR',
                key: razorpaykey,
                name: 'INO TRAVELS',
                order_id: packageData.razorpayOrderId,   // ✔ correct
                prefill: {
                    name: decoded.name,
                    email: decoded.email,
                    contact: decoded.phoneNumber && decoded.phoneNumber !== "NA"
                        ? decoded.phoneNumber
                        : '',
                },
                theme: { color: '#3399cc' },
            };

            RazorpayCheckout.open(options)
                .then(async (response) => {
                    await handlePaymentConfirm(
                        response.razorpay_payment_id,
                        response.razorpay_order_id,
                        response.razorpay_signature
                    );
                })
                .catch((error) => {
                    Toast.show("Booking not confirmed. Payment was cancelled.");
                });

        } catch (error) {
            console.log("Error opening Razorpay:", error);
        }
    };


    const handleBook = async () => {
        try {
            const token = await SecureStore.getItemAsync("token");

            const result = await dispatch(
                bookPackage({ data: bookingData.book, token })
            ).unwrap();
            setBookPackageData(result.data)
            await openRazorpay(result?.data);
        } catch (err) {
            console.log("173", err);
            setShowFailure(true);
        }
    };




    return (
        <View style={styles2.container}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
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

                    <Text style={styles.pkgTitle}>Booking Summary</Text>
                </View>
                <View style={styles.badgeContainer}>
                    <View
                        style={[
                            styles.badge,
                            { backgroundColor: "#EBF4FF", borderColor: "#BFDBFE" },
                        ]}
                    >
                        <Text style={[styles.badgeText, { color: "#1E40AF" }]}>{bookingData.car?.carType}</Text>
                    </View>
                    <View
                        style={[
                            styles.badge,
                            { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" },
                        ]}
                    >
                        <Text style={[styles.badgeText, { color: "#047857" }]}>{bookingData.car?.acAvailable ? "AC Available" : "No AC"}</Text>
                    </View>
                </View>

            </View>

            <ScrollView contentContainerStyle={styles2.scrollContent}>
                {/* SPECIFICATIONS */}
                <View style={styles2.section}>
                    <View style={styles2.grid}>
                        {/* Capacity */}
                        <View style={styles2.gridItem}>
                            <Text style={styles2.gridLabel}>Capacity</Text>
                            <Text style={styles2.gridValue}>{bookingData.car?.capacity}</Text>
                            <Text style={styles2.gridSub}>
                                {bookingData.car?.capacity == 1 ? "Passenger" : "Passengers"}
                            </Text>
                        </View>

                        {/* Luggage */}
                        <View style={styles2.gridItem}>
                            <Text style={styles2.gridLabel}>Luggage</Text>
                            <Text style={styles2.gridValue}>
                                {bookingData.car?.luggageCapacity}
                            </Text>
                            <Text style={styles2.gridSub}>
                                {bookingData.car?.luggageCapacity == 1
                                    ? "Large bag"
                                    : "Large bags"}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* NOTES */}
                {bookingData.car?.notes ? (
                    <View style={styles2.notesSection}>
                        <Text style={styles2.notesTitle}>Additional Information</Text>
                        <Text style={styles2.notesText}>{bookingData.car?.notes}</Text>
                    </View>
                ) : null}

                {/* SEASON INFO */}
                <View style={styles2.section}>
                    <Text style={styles2.sectionTitle}>Season Info</Text>

                    <View style={styles2.grid}>
                        <View style={styles2.gridItem2}>
                            <Text style={styles2.smallLabel}>Travel Date</Text>
                            <Text style={styles2.boldValue}>
                                {bookingData.book?.journeyStartDate}
                            </Text>
                        </View>

                        <View style={styles2.gridItem2}>
                            <Text style={styles2.smallLabel}>Number of days</Text>
                            <Text style={styles2.boldValue}>
                                {carDetails.durationDays}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* PRICE BREAKDOWN */}
                <View style={styles2.priceBox}>
                    <Text style={styles2.sectionTitle}>Price Breakdown</Text>

                    <View style={styles2.priceRow}>
                        <Text style={styles2.priceLabel}>Total Price</Text>
                        <Text style={styles2.priceValueGreen}>₹{price.toLocaleString()}</Text>
                    </View>

                    <View style={styles2.priceRow}>
                        <Text style={styles2.priceLabel}>Pay Now</Text>
                        <Text style={styles2.priceValueOrange}>₹{payNow.toLocaleString()}</Text>
                    </View>

                    <View style={styles2.priceRow}>
                        <Text style={styles2.priceLabel}>Remaining Amount</Text>
                        <Text style={styles2.priceValueBlue}>₹{remaining.toLocaleString()}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* FOOTER BUTTONS */}
            <View style={styles2.footer}>
                <TouchableOpacity
                    style={styles2.cancelBtn}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles2.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles2.confirmBtn}
                    onPress={handleBook}
                >
                    <Text style={styles2.confirmText}>Confirm Payment</Text>
                </TouchableOpacity>
            </View>
            <CarPackageSuccessModal
                visible={visible}
                bookingId={bookPackageData?.bookingGroupCode}
                paidAt={paidAt}
                total={bookPackageData?.initialAmount}
                travelDate={myData.travelDate}
                numberofdays={carDetails.durationDays}
                onClose={() => {
                    setVisible(false);
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

export default CarPackageBill;

const styles = StyleSheet.create({
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    header: {
        padding: 16,
        marginBottom: 16,
        marginTop: 30,
    },
    headerTitle: {
        color: "white",
        fontSize: 18,
        fontWeight: "600",
    },
    iconButton: {
        padding: 6,
        marginRight: 8,
        borderRadius: 999,
    },
    pkgTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#111827",
    },
    badgeContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    badge: {
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginRight: 8,
    },
    badgeText: {
        fontSize: 13,
        fontWeight: "500",
    },
})

const styles2 = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },

    scrollContent: {
        paddingBottom: 120,
    },

    /* HEADER */
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderColor: "#E5E7EB",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1F2937",
    },
    headerSubtitle: {
        fontSize: 13,
        color: "#6B7280",
        marginTop: 2,
    },
    closeBtn: {
        fontSize: 32,
        color: "#9CA3AF",
    },

    /* COMMON SECTION */
    section: {
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderColor: "#F3F4F6",
    },

    /* CAR INFO */
    carName: {
        fontSize: 28,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 8,
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
    },

    badgeBlue: {
        backgroundColor: "#EFF6FF",
        borderColor: "#BFDBFE",
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
    },
    badgeBlueText: {
        color: "#1D4ED8",
        fontWeight: "600",
        fontSize: 13,
    },

    badgeGreen: {
        backgroundColor: "#ECFDF5",
        borderColor: "#A7F3D0",
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
    },
    badgeGreenText: {
        color: "#059669",
        fontWeight: "600",
        fontSize: 13,
    },

    badgeGray: {
        backgroundColor: "#F3F4F6",
        borderColor: "#D1D5DB",
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
    },
    badgeGrayText: {
        color: "#4B5563",
        fontWeight: "600",
        fontSize: 13,
    },

    /* GRID */
    grid: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    gridItem: {
        flex: 1,
        alignItems: "center",
    },
    gridLabel: {
        fontSize: 14,
        color: "#111827",
        fontWeight: "600",
        marginBottom: 4,
    },
    gridValue: {
        fontSize: 26,
        fontWeight: "700",
        color: "#2563EB",
    },
    gridSub: {
        fontSize: 13,
        color: "#6B7280",
    },

    gridItem2: {
        flex: 1,
        alignItems: "center",
        marginVertical: 10,
    },
    smallLabel: {
        color: "#6B7280",
        fontSize: 13,
    },
    boldValue: {
        fontSize: 16,
        fontWeight: "600",
        marginTop: 4,
    },

    /* NOTES */
    notesSection: {
        padding: 20,
        backgroundColor: "#F9FAFB",
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "#E5E7EB",
    },
    notesTitle: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 6,
        color: "#111827",
    },
    notesText: {
        fontSize: 14,
        color: "#374151",
        lineHeight: 20,
    },

    /* PRICE */
    priceBox: {
        backgroundColor: "#F9FAFB",
        padding: 20,
        borderTopWidth: 1,
        borderColor: "#E5E7EB",
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 12,
        color: "#1F2937",
    },

    priceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
    },
    priceLabel: {
        fontSize: 15,
        fontWeight: "500",
        color: "#374151",
    },
    priceValueGreen: {
        color: "#059669",
        fontWeight: "700",
        fontSize: 20,
    },
    priceValueOrange: {
        color: "#EA580C",
        fontWeight: "700",
        fontSize: 18,
    },
    priceValueBlue: {
        color: "#2563EB",
        fontWeight: "700",
        fontSize: 18,
    },

    /* FOOTER */
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        padding: 16,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderColor: "#E5E7EB",
        justifyContent: "space-between",
    },

    cancelBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        padding: 14,
        borderRadius: 10,
        marginRight: 10,
        alignItems: "center",
    },
    cancelText: {
        color: "#374151",
        fontSize: 16,
        fontWeight: "600",
    },

    confirmBtn: {
        flex: 1,
        backgroundColor: "#2563EB",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
    },
    confirmText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
});
