import {
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getTourDetails } from '@/components/Redux/tourPackageSlice';
import Carousel from "react-native-reanimated-carousel";
import * as SecureStore from "expo-secure-store";
import Swiper from "react-native-swiper";
import { LinearGradient } from 'expo-linear-gradient';
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
const TourPackageDetails = ({ route, navigation }) => {
    const { tourPackage } = route.params;
    let finalData=null;
    if(typeof tourPackage==='string'){
          const jsonString = atob(tourPackage);
          const dt = {
            id: jsonString.id,
            travelDate: jsonString.travelDate
        }
        finalData = dt
    }else{
        finalData=tourPackage
    }
    // useEffect(() => {
    //     console.log(data)
    // }, [data])

    const dispatch = useDispatch()
    const { tourDetails, tourDetailsLoading, tourDetailsError, tourDetailsStatus } = useSelector((state) => state.tour)
    const handleBookNow = async (price, packageDet) => {
        const token = await SecureStore.getItemAsync("token");
        if (token) {
            navigation.navigate("tourbill", { bookingPrice: price, pkg: packageDet, finalData, loggedIn: true, tourDetails });
        } else {
            navigation.navigate("tourbill", { bookingPrice: price, pkg: packageDet, finalData, loggedIn: false, tourDetails });
        }
    };
    //Booking khotom
    const [mnth, setMnth] = useState()
    useEffect(() => {
        const [day, month, year] = finalData.travelDate.split("-");
        setMnth(month)
    }, [finalData])
    const getDetails = useCallback(() => {
        dispatch(getTourDetails({ id: finalData.id }));
    }, [dispatch, finalData])
    useEffect(() => {
        getDetails()
    }, [getTourDetails])

    const shareData = {
        id: finalData.id,
        travelDate: finalData.travelDate
    }

    const encoded = btoa(JSON.stringify(shareData));
    const shareUrl = `https://www.ino.com/tourdetails?tourPackage=${encoded}`;

    return (
        <ScrollView style={{ backgroundColor: '#f9fafb' }}>
            {tourDetails && (
                <>
                    {/* Hero Section */}
                    <View style={styles.heroContainer}>
                        {/* Hero Image */}
                        <Image
                            source={{ uri: tourDetails.thumbnailUrl }}
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
                            <Text style={styles.heroTitle}>{tourDetails.title}</Text>
                            <Text style={styles.heroSubtitle}>
                                {tourDetails.destination.name} ({tourDetails.destination.state})
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
                            <Text style={styles.pointText}>{tourDetails.pickupLocation}</Text>
                        </View>

                        <ArrowIcon />

                        <View style={styles.pickDropBlock}>
                            <View style={styles.iconLabel}>
                                <LocationIcon color="#16a34a" />
                                <Text style={[styles.pickLabel, { color: '#16a34a' }]}>Drop</Text>
                            </View>
                            <Text style={[styles.pointText, { color: '#166534' }]}>
                                {tourDetails.dropLocation}
                            </Text>
                        </View>
                    </View>
                    {/* Itinerary */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Itinerary</Text>
                        {tourDetails.itineraries.map((day) => (
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
                        <Text style={styles.sectionTitle}>Packages</Text>
                        <View style={styles2.container}>
                            <Carousel
                                width={width}
                                height={500}
                                autoPlay
                                loop
                                data={tourDetails?.tourPackageTypes}
                                scrollAnimationDuration={1500}
                                renderItem={({ item: pkg, index }) => {
                                    const activePrice =
                                        pkg.seasonPrices?.find(
                                            (season) =>
                                                season.isActive &&
                                                mnth >= season.startMonth &&
                                                mnth <= season.endMonth
                                        )?.price || pkg.seasonPrices?.[0]?.price || 0;

                                    const images = [
                                        ...(pkg.sampleHotelImageUrls || []),
                                        ...(pkg.sampleCarImageUrls || []),
                                    ];
                                    return (
                                        <View key={index} style={styles2.card}>
                                            {/* Inner image carousel */}
                                            <View style={{ height: 250 }}>
                                                <Swiper
                                                    autoplay
                                                    autoplayTimeout={3}
                                                    showsPagination={true}
                                                    dotStyle={styles.dot}
                                                    activeDotStyle={styles.activeDot}
                                                    loop
                                                >
                                                    {images && images.length > 0 ? (
                                                        images.map((url, index) => (
                                                            <Image
                                                                key={index}
                                                                source={{ uri: url }}
                                                                style={{ width: "100%", height: "100%" }}
                                                                resizeMode="cover"
                                                            />
                                                        ))
                                                    ) : (
                                                        <Image
                                                            source={{
                                                                uri: "https://via.placeholder.com/400x300?text=No+Image",
                                                            }}
                                                            style={{ width: "100%", height: "100%" }}
                                                            resizeMode="cover"
                                                        />
                                                    )}
                                                </Swiper>
                                            </View>
                                            {/* Card content */}
                                            <View style={styles2.content}>
                                                <Text style={styles2.title}>
                                                    {pkg.tourType.toUpperCase()} Package
                                                </Text>
                                                {/* Accommodation */}
                                                <View style={styles2.infoRow}>
                                                    <Svg
                                                        width={22}
                                                        height={22}
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="#2563eb"
                                                        strokeWidth={2}
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <Path d="M3 7v13h18V7H3zm0-4h18v4H3V3zM7 11h10v2H7v-2z" />
                                                    </Svg>
                                                    <View>
                                                        <Text style={styles2.label}>Accommodation</Text>
                                                        <Text style={styles2.value}>{pkg.hotelType}</Text>
                                                    </View>
                                                </View>
                                                {/* Transportation */}
                                                <View style={styles2.infoRow}>
                                                    <Svg
                                                        width={22}
                                                        height={22}
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="#16a34a"
                                                        strokeWidth={2}
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <Path d="M3 13l1.5-5h15L21 13M5 13v6m14-6v6M7 19a1 1 0 110-2 1 1 0 010 2zm10 0a1 1 0 110-2 1 1 0 010 2z" />
                                                    </Svg>
                                                    <View>
                                                        <Text style={styles2.label}>Transportation</Text>
                                                        <Text style={styles2.value}>{pkg.carTypes}</Text>
                                                    </View>
                                                </View>

                                                {/* Price + Button */}
                                                <View style={styles2.footer}>
                                                    <Text style={styles2.price}>
                                                        ₹{activePrice.toLocaleString("en-IN")}
                                                    </Text>
                                                    <TouchableOpacity
                                                        style={styles2.bookButton}
                                                        onPress={() =>
                                                            handleBookNow(activePrice.toLocaleString("en-IN"), pkg)
                                                        }
                                                    >
                                                        <Text style={styles2.bookText}>Book Now →</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    );
                                }}
                            />
                        </View>
                    </View>

                    {/* Included / Excluded */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Package Details</Text>
                        <View style={styles.detailRow}>
                            <View style={styles.detailBlock}>
                                <Text style={styles.detailHeader}>Included</Text>
                                {tourDetails.included.map((item, i) => (
                                    <Text key={i} style={styles.detailText}>• {item}</Text>
                                ))}
                            </View>
                            <View style={styles.detailBlock}>
                                <Text style={styles.detailHeader}>Excluded</Text>
                                {tourDetails.excluded.map((item, i) => (
                                    <Text key={i} style={styles.detailText}>• {item}</Text>
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

export default TourPackageDetails;

const styles2 = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
        // paddingVertical: 10,

    },
    card: {
        width: width - 40,
        backgroundColor: "#fff",
        borderRadius: 20,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        alignSelf: "center",
    },
    image: {
        width: "100%", height: "100%", resizeMode: "cover"
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        marginBottom: 10,
    },
    label: {
        fontSize: 15,
        fontWeight: "600",
        color: "#111827",
    },
    value: {
        fontSize: 14,
        color: "#6b7280",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 10,
    },
    price: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
    },
    bookButton: {
        backgroundColor: "#2563eb",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    bookText: {
        color: "#fff",
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