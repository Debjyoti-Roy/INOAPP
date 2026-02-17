import { StyleSheet, Text, TouchableOpacity, View, ScrollView, SafeAreaView } from 'react-native'
import React from 'react'
import Svg, { Path } from "react-native-svg";

// Added navigation prop so your back button works
const Termsandcondition = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            {/* Header Banner */}
            <View style={styles.banner}>
                <View style={styles.bannerContent}>
                    <TouchableOpacity
                        onPress={() => navigation?.goBack()}
                        style={styles.backButton}
                    >
                        <Svg
                            width={24}
                            height={24}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth={2.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <Path d="M15 18l-6-6 6-6" />
                        </Svg>
                    </TouchableOpacity>
                    <Text style={styles.bannerText}>Terms & Conditions</Text>
                </View>
            </View>

            {/* Content Area */}
            <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.textContainer}>
                    <Text style={styles.lastUpdated}>Last Updated: February 2026</Text>
                    
                    <Text style={styles.sectionTitle}>1. Services Offered</Text>
                    <Text style={styles.bodyText}>
                        Our platform acts as a facilitator, allowing users to book hotel accommodations, holiday packages, car rentals, and point-to-point taxi services (e.g., NJP to North Sikkim).
                    </Text>

                    <Text style={styles.sectionTitle}>2. Booking & Payment</Text>
                    <Text style={styles.bodyText}>
                        All bookings are subject to availability. Payments must be made in full or as per the partial payment policy specified at the time of booking. Prices are subject to change based on seasonal demand or fuel price hikes.
                    </Text>

                    <Text style={styles.sectionTitle}>3. Car & Taxi Services</Text>
                    <Text style={styles.bodyText}>
                        For car packages and pickups:
                        {"\n"}• Vehicle models are subject to availability.
                        {"\n"}• Permits for restricted areas (like North Sikkim) are the responsibility of the driver/vendor unless stated otherwise.
                        {"\n"}• Waiting charges may apply if the traveler exceeds the scheduled pickup time.
                    </Text>

                    <Text style={styles.sectionTitle}>4. Cancellation & Refunds</Text>
                    <Text style={styles.bodyText}>
                        Cancellations are governed by the specific vendor's policy (Hotel/Transporter). Our service fee is non-refundable. Refunds, if applicable, will be processed within 7-10 business days.
                    </Text>

                    <Text style={styles.sectionTitle}>5. Liability Disclaimer</Text>
                    <Text style={styles.bodyText}>
                        We are not liable for delays, accidents, or service deficiencies caused by third-party vendors. In cases of landslides or roadblocks in hilly terrains, additional costs for route changes must be borne by the user.
                    </Text>
                    
                    {/* Add extra padding at the bottom */}
                    <View style={{ height: 40 }} />
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Termsandcondition

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9F9F9" },
    banner: {
        backgroundColor: "#2196F3",
        paddingTop: 60, // Adjusted for SafeAreaView
        paddingVertical: 10,
        paddingHorizontal: 20,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    bannerContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    backButton: {
        marginRight: 12,
        padding: 4,
    },
    bannerText: { color: "white", fontSize: 20, fontWeight: "bold" },
    contentScroll: {
        flex: 1,
    },
    textContainer: {
        padding: 20,
    },
    lastUpdated: {
        fontSize: 14,
        color: "#666",
        marginBottom: 20,
        fontStyle: 'italic'
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginTop: 20,
        marginBottom: 8,
    },
    bodyText: {
        fontSize: 15,
        color: "#555",
        lineHeight: 22,
    },
})