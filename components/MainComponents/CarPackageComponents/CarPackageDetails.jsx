import {
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getCarDetails } from '@/components/Redux/carPackageSlice';
import Carousel from "react-native-reanimated-carousel";
import * as SecureStore from "expo-secure-store";
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { encode as btoa, decode as atob } from "base-64";
import HotelShareButton from '../ShareButtons/HotelShareButton';

const LocationIcon = ({ color = '#2563eb', size = 20 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
    </Svg>
);

const CarIcon = ({ color = '#16a34a', size = 22 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M5 11h14l1.5 4.5h-17L5 11zm0 0V7a2 2 0 012-2h10a2 2 0 012 2v4M7 19a1 1 0 110-2 1 1 0 010 2zm10 0a1 1 0 110-2 1 1 0 010 2z" />
    </Svg>
);

const HotelIcon = ({ color = '#2563eb', size = 22 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M4 22V10a6 6 0 0112 0v12h2v-6h2v8H2v-8h2v6h2zm8-12a4 4 0 10-8 0v12h8V10z" />
    </Svg>
);

const ArrowIcon = ({ color = '#4f46e5', size = 26 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M5 12h14M12 5l7 7-7 7" />
    </Svg>
);
const CancelIcon = ({ color = "#2563eb", size = 26 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M18.364 5.636L5.636 18.364M5.636 5.636L18.364 18.364"
            stroke={color}
            strokeWidth={2.2}
            strokeLinecap="round"
        />
    </Svg>
);

const RefundIcon = ({ color = "#2563eb", size = 26 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M12 8v4l3 3m6-3a9 9 0 11-9-9 9 9 0 019 9z"
            stroke={color}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);
const SupportIcon = ({ color = "#2563eb", size = 26 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M18 10a6 6 0 00-12 0v4a6 6 0 0012 0v-4z"
            stroke={color}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M22 10h-2a8 8 0 00-16 0H2"
            stroke={color}
            strokeWidth={2.2}
            strokeLinecap="round"
        />
    </Svg>
);

const { width, height } = Dimensions.get('window');

const CarPackageDetails = ({ route, navigation }) => {
    const dispatch = useDispatch();
    const { carPackage } = route.params;
    let finalData = null;
    if (typeof carPackage === 'string') {
        const jsonString = atob(carPackage);
        const dt = {
            id: jsonString.packageId,
            travelDate: jsonString.travelDate
        }
        finalData = dt
    } else {
        finalData = carPackage
    }
    useEffect(() => {
        console.log(finalData)
    }, [finalData])

    const {
        carDetails,
        carDetailsLoading,
        carDetailsError,
        carDetailsStatus,
        bookPackageData,
        bookPackageError,
        bookPackageLoading,
    } = useSelector((state) => state.car);
    useEffect(() => {
        dispatch(getCarDetails({ id: finalData.id }));
    }, [finalData])

    useEffect(() => {
        console.log(finalData)
        console.log(carDetails)
    }, [carDetails])

    const handleBookNow = (applicablePrice, car) => {
        // console.log("HELLO")
        const [day, month, year] = finalData.travelDate.split("-");
        const formattedDate = `${year}-${month}-${day}`;
        const book = {
            seasonId: applicablePrice.seasonPriceId,
            journeyStartDate: formattedDate,
        };
        const bookingData = {
            book,
            applicablePrice,
            car
        }
        navigation.navigate("CarPackageBill", { applicablePrice, car, carDetails, myData: finalData, bookingData });
    }

    const shareData = {
        packageId: finalData.id,
        travelDate: finalData.travelDate
    }

    const encoded = btoa(JSON.stringify(shareData));
    const shareUrl = `https://www.ino.com/carpackagedetails?carPackage=${encoded}`;


    return (
        <ScrollView style={{ backgroundColor: '#f9fafb' }}>
            {carDetails && (
                <>
                    {/* Hero Section */}
                    {/* <View>
                        <Image source={{ uri: carDetails.thumbnailUrl }} style={styles.heroImage} />
                        <View style={styles.heroOverlay} />
                        <View style={styles.heroText}>
                            <Text style={styles.heroTitle}>{carDetails.title}</Text>
                            <Text style={styles.heroSubtitle}>
                                Destination: {carDetails.destination.name} ({carDetails.destination.state})
                            </Text>
                        </View>
                    </View> */}
                    <View style={styles.heroContainer}>
                        {/* Hero Image */}
                        <Image
                            source={{ uri: carDetails.thumbnailUrl }}
                            style={styles.heroImage}
                            resizeMode="cover"
                        />

                        {/* Gradient Overlay */}
                        <LinearGradient
                            colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)', 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.heroOverlay}
                        />

                        {/* Back Button */}
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Svg
                                width={22}
                                height={22}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <Path d="M6 12H5M12 19l-7-7 7-7" />
                            </Svg>
                        </TouchableOpacity>
                        {/* Text Content */}
                        <View style={styles.heroContent}>
                            <Text style={styles.heroTitle}>{carDetails.title}</Text>
                            <Text style={styles.heroSubtitle}>
                                {carDetails.destination.name} ({carDetails.destination.state})
                            </Text>
                        </View>
                        <HotelShareButton
                            url={shareUrl}
                            message={`Check out this car package`}
                        />
                    </View>


                    {/* Pickup & Drop */}
                    <View style={styles.pickDropCard}>
                        <View style={styles.pickDropBlock}>
                            <View style={styles.iconLabel}>
                                <LocationIcon color="#2563eb" />
                                <Text style={styles.pickLabel}>Pickup</Text>
                            </View>
                            <Text style={styles.pointText}>{carDetails.pickupLocation}</Text>
                        </View>

                        <ArrowIcon />

                        <View style={styles.pickDropBlock}>
                            <View style={styles.iconLabel}>
                                <LocationIcon color="#16a34a" />
                                <Text style={[styles.pickLabel, { color: '#16a34a' }]}>Drop</Text>
                            </View>
                            <Text style={[styles.pointText, { color: '#166534' }]}>
                                {carDetails.dropLocation}
                            </Text>
                        </View>
                    </View>
                    {/* Itinerary */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Itinerary</Text>
                        {carDetails.itineraries.map((day) => (
                            <View key={day.dayNumber} style={styles.itineraryCard}>
                                <Image source={{ uri: day.imageUrl }} style={styles.itineraryImage} />
                                <View style={styles.itineraryContent}>
                                    <Text style={styles.dayTitle}>
                                        Day {day.dayNumber}: <Text style={styles.dayHighlight}>{day.title}</Text>
                                    </Text>
                                    <Text style={styles.dayDesc}>{day.description}</Text>
                                </View>
                            </View>
                        ))}
                    </View>


                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Available Cars</Text>

                        <View style={styles2.container}>
                            {carDetails.carDetails.map((car) => {
                                const [day, month, year] = finalData.travelDate.split("-");
                                const applicablePrice = month
                                    ? car.carPrices?.find(
                                        (p) => month >= p.startMonth && month <= p.endMonth
                                    )
                                    : null;

                                return (
                                    <View key={car.carId} style={styles2.card}>

                                        {/* LEFT CONTENT */}
                                        <View style={styles2.leftContent}>
                                            <Text style={styles2.carName}>{car.carName}</Text>

                                            <Text style={styles2.subText}>
                                                Type: {car.carType} | Capacity: {car.capacity} | Luggage: {car.luggageCapacity}
                                            </Text>

                                            <Text style={styles2.subText}>
                                                AC: {car.acAvailable ? "Yes" : "No"}
                                            </Text>

                                            {car.notes ? (
                                                <Text style={styles2.notes}>{car.notes}</Text>
                                            ) : null}
                                        </View>

                                        {/* RIGHT CONTENT */}
                                        <View style={styles2.rightContent}>
                                            <View style={styles2.priceBox}>
                                                <Text style={styles2.priceLabel}>Price</Text>

                                                {applicablePrice ? (
                                                    <Text style={styles2.priceValue}>₹{applicablePrice.price}</Text>
                                                ) : (
                                                    <Text style={styles2.noPrice}>No price available</Text>
                                                )}
                                            </View>

                                            <TouchableOpacity
                                                style={styles2.bookBtn}
                                                onPress={() => handleBookNow(applicablePrice, car)}
                                            >
                                                <Text style={styles2.bookBtnText}>Book Now</Text>
                                            </TouchableOpacity>
                                        </View>

                                    </View>
                                );
                            })}
                        </View>
                    </View>




                    {/* Included / Excluded */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Package Details</Text>
                        <View style={styles.detailRow}>
                            <View style={styles.detailBlock}>
                                <Text style={styles.detailHeader}>Included</Text>
                                {carDetails.includedFeatures.map((item, i) => (
                                    <Text key={i} style={styles.detailText}>• {item.description}</Text>
                                ))}
                            </View>
                            <View style={styles.detailBlock}>
                                <Text style={styles.detailHeader}>Excluded</Text>
                                {carDetails.excludedFeatures.map((item, i) => (
                                    <Text key={i} style={styles.detailText}>• {item.description}</Text>
                                ))}
                            </View>
                        </View>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.heading}>Our Premium Cancellation Policy</Text>

                        {/* Section 1 */}
                        <View style={styles.row}>
                            <CancelIcon color="#2563eb" />
                            <View style={styles.textBlock}>
                                <Text style={styles.title}>Flexible & Hassle-Free Cancellations</Text>
                                <Text style={styles.text}>
                                    100% refund for cancellations made 10 days or more before your
                                    scheduled trip. No refund for cancellations made within 10 days.
                                </Text>
                            </View>
                        </View>

                        {/* Section 2 */}
                        <View style={styles.row}>
                            <RefundIcon color="#2563eb" />
                            <View style={styles.textBlock}>
                                <Text style={styles.title}>Easy & Transparent Refunds</Text>
                                <Text style={styles.text}>
                                    Eligible refunds will be processed within{" "}
                                    <Text style={styles.bold}>5–7 business days</Text> to your
                                    original payment method.
                                </Text>
                            </View>
                        </View>

                        {/* Section 3 */}
                        <View style={[styles.row, { paddingBottom: 0 }]}>
                            <SupportIcon color="#2563eb" />
                            <View style={styles.textBlock}>
                                <Text style={styles.title}>24/7 Guest Support</Text>
                                <Text style={styles.text}>
                                    Our support team is available 24/7 to assist with any
                                    modifications, emergencies, or travel requests.
                                </Text>
                            </View>
                        </View>
                    </View>
                </>
            )}
        </ScrollView>
    )
}

export default CarPackageDetails


const styles2 = StyleSheet.create({
    listContainer: {
        paddingVertical: 20,
        gap: 24, // same as space-y-6
        paddingHorizontal: 15,
    },

    card: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 12,
        padding: 16,
        flexDirection: "column",
        elevation: 3,
    },

    leftContent: {
        flex: 1,
        paddingRight: 12,
    },

    carName: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1f2937",
    },

    subText: {
        marginTop: 4,
        fontSize: 14,
        color: "#4b5563",
    },

    notes: {
        marginTop: 8,
        fontSize: 15,
        color: "#6b7280",
        fontStyle: "italic",
    },

    rightContent: {
        marginTop: 18,
        alignSelf: "flex-end",
        flexDirection: "column",
        alignItems: "flex-end",
    },

    priceBox: {
        alignItems: "flex-end",
    },

    priceLabel: {
        color: "#6b7280",
        fontSize: 14,
    },

    priceValue: {
        fontSize: 18,
        fontWeight: "600",
        color: "#2563eb",
    },

    noPrice: {
        fontSize: 14,
        color: "#9ca3af",
        fontStyle: "italic",
    },

    bookBtn: {
        marginTop: 10,
        backgroundColor: "#2563eb",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        elevation: 3,
    },

    bookBtnText: {
        color: "white",
        fontSize: 14,
        fontWeight: "600",
    },
});



const styles = StyleSheet.create({
    heroContainer: {
        height: height * 0.4,
        position: "relative",
    },

    heroImage: {
        width: "100%",
        height: "100%",
    },

    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
    },

    heroContent: {
        position: "absolute",
        bottom: 24,
        left: 24,
        right: 24,
    },

    heroTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: "white",
        marginBottom: 6,
    },

    heroSubtitle: {
        fontSize: 16,
        color: "white",
        opacity: 0.9,
    },

    backButton: {
        position: "absolute",
        top: 40,
        left: 20,
        padding: 6,
        borderRadius: 50,
        zIndex: 10,
    },

    pickDropCard: {
        backgroundColor: '#eef2ff',
        margin: 16,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    pickDropBlock: { alignItems: 'center', flex: 1 },
    iconLabel: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    pickLabel: { fontWeight: '700', color: '#2563eb', fontSize: 16 },
    pointText: { marginTop: 6, fontSize: 15, fontWeight: '600', color: '#1e3a8a' },
    section: { padding: 20 },
    sectionTitle: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 16 },
    itineraryCard: { marginBottom: 20, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', elevation: 2 },
    itineraryImage: { width: '100%', height: 200 },
    itineraryContent: { padding: 14 },
    dayTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, color: '#111827' },
    dayHighlight: { color: '#2563eb' },
    dayDesc: { color: '#374151', fontSize: 15, lineHeight: 22 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    detailBlock: { flex: 1 },
    detailHeader: { fontWeight: '700', fontSize: 18, color: '#111827', marginBottom: 6 },
    detailText: { color: '#4b5563', fontSize: 15, marginBottom: 4 },
    container: {
        padding: 16,
        backgroundColor: "#f9fafb",
    },
    card: { padding: 20 },
    heading: {
        fontSize: 22,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 20,
        textAlign: "center",
    },
    row: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        paddingBottom: 18,
    },
    textBlock: {
        flex: 1,
    },
    title: {
        fontSize: 17,
        fontWeight: "600",
        color: "#1f2937",
    },
    text: {
        fontSize: 15,
        color: "#374151",
        marginTop: 6,
        lineHeight: 22,
    },
    bold: {
        fontWeight: "700",
    },

    dot: {
        backgroundColor: "rgba(255,255,255,0.5)",
        width: 6,
        height: 6,
        borderRadius: 3,
        marginHorizontal: 3,
    },
    activeDot: {
        backgroundColor: "#fff",
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 3,
    },
});