import React, { useEffect, useMemo, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import polyline from "@mapbox/polyline";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
    getLatestCarPickupBooking,
    getAllCarPickupBookings,
    cancelCarPickupBookings,
    resetCancel,
} from "./../../Redux/profileSlice";
import Toast from "react-native-root-toast";

const { width } = Dimensions.get('window');

const formatDate = (isoString) => {
    if (!isoString) return "—";
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const statusColors = {
    PENDING: { bg: "#FFFBEB", text: "#92400E", border: "#FEF3C7" },
    CONFIRMED: { bg: "#F0FDF4", text: "#166534", border: "#DCFCE7" },
    CANCELLED: { bg: "#FEF2F2", text: "#991B1B", border: "#FEE2E2" },
    COMPLETED: { bg: "#EFF6FF", text: "#1E40AF", border: "#DBEAFE" },
};

const MyCarPickupBookings = () => {
    const mapRef = useRef(null);
    const dispatch = useDispatch();
    const {
        latestCarPickupBooking,
        latestCarPickupBookingLoading,
        allCarPickupBookings,
        allCarPickupBookingsLoading,
        cancelCarPickupBookingSuccess,
        cancelCarPickupBookingLoading,
        cancelCarPickupBookingError
    } = useSelector((state) => state.profile);

    const routeCoordinates = useMemo(() => {
        if (latestCarPickupBooking?.encodedPolyline) {
            const decoded = polyline.decode(latestCarPickupBooking.encodedPolyline);
            return decoded.map(([latitude, longitude]) => ({
                latitude,
                longitude,
            }));
        }
        return [];
    }, [latestCarPickupBooking?.encodedPolyline]);

    // 2. Automatically fit the map to the route once coordinates are available
    const onMapReady = () => {
        if (routeCoordinates.length > 0 && mapRef.current) {
            mapRef.current.fitToCoordinates(routeCoordinates, {
                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                animated: true,
            });
        }
    };

    useEffect(() => {
        dispatch(getLatestCarPickupBooking());
        dispatch(getAllCarPickupBookings());
    }, [dispatch]);

    useEffect(() => {
        if (cancelCarPickupBookingSuccess) {
            dispatch(getLatestCarPickupBooking());
            dispatch(getAllCarPickupBookings());
            dispatch(resetCancel());
        }
    }, [cancelCarPickupBookingSuccess]);

    useEffect(() => {
        if (cancelCarPickupBookingError !== null) {
            let toast = Toast.show("Facing Problem in Cancelling the Ride!", {
                duration: Toast.durations.SHORT,
                position: Toast.positions.BOTTOM,
                shadow: true,
                animation: true,
                hideOnPress: true,
                delay: 0,
            });
            setTimeout(() => Toast.hide(toast), 2000);
        }
    }, [cancelCarPickupBookingError])


    const handleCancel = (bookingId) => {
        dispatch(cancelCarPickupBookings({ bookingId }));
    };

    const canCancel = (status) => status === 'PENDING' || status === 'CONFIRMED';

    const otherBookings = (allCarPickupBookings || []).filter(
        (b) => b.bookingId !== latestCarPickupBooking?.bookingId
    );

    if (latestCarPickupBookingLoading || allCarPickupBookingsLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.loadingText}>Fetching your rides...</Text>
            </View>
        );
    }

    const renderLatestBooking = () => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.headerTitle}>Latest Pickup</Text>
                    <Text style={styles.headerSub}>ID: {latestCarPickupBooking.bookingId}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColors[latestCarPickupBooking.status]?.bg }]}>
                    <Text style={[styles.statusText, { color: statusColors[latestCarPickupBooking.status]?.text }]}>
                        {latestCarPickupBooking.status}
                    </Text>
                </View>
            </View>

            <View style={styles.mapContainer}>
                <MapView
                    ref={mapRef}
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    onMapReady={onMapReady}
                // No initialRegion needed; fitToCoordinates handles the view
                >
                    {routeCoordinates.length > 0 && (
                        <>
                            {/* The actual route line */}
                            <Polyline
                                coordinates={routeCoordinates}
                                strokeColor="#2196F3"
                                strokeWidth={4}
                            />
                            {/* Start Marker */}
                            <Marker coordinate={routeCoordinates[0]} title="Pickup" pinColor="green" />
                            {/* End Marker */}
                            <Marker coordinate={routeCoordinates[routeCoordinates.length - 1]} title="Dropoff" />
                        </>
                    )}
                </MapView>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.infoGrid}>
                    <InfoItem icon="map-marker-radius" iconColor="#4CAF50" label="Pick Up" value={latestCarPickupBooking.pickUpLocation} />
                    <InfoItem icon="map-marker-check" iconColor="#F44336" label="Drop Off" value={latestCarPickupBooking.dropLocation} />
                    <InfoItem icon="calendar-clock" iconColor="#2196F3" label="Date & Time" value={formatDate(latestCarPickupBooking.pickUpTime)} />
                    <InfoItem icon="currency-inr" iconColor="#00897B" label="Amount" value={latestCarPickupBooking.price ? `₹${latestCarPickupBooking.price}` : "—"} />
                </View>

                {canCancel(latestCarPickupBooking.status) && (
                    <TouchableOpacity
                        style={[styles.cancelButton, cancelCarPickupBookingLoading && { opacity: 0.6 }]}
                        onPress={() => handleCancel(latestCarPickupBooking.id)}
                        disabled={cancelCarPickupBookingLoading}
                    >
                        <Text style={styles.cancelButtonText}>
                            {cancelCarPickupBookingLoading ? "Processing..." : "Cancel Trip"}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {latestCarPickupBooking ? renderLatestBooking() : (
                <View style={styles.noBooking}>
                    <MaterialCommunityIcons name="car-off" size={48} color="#cbd5e1" />
                    <Text style={styles.emptyText}>No recent pickup bookings</Text>
                </View>
            )}

            <Text style={styles.sectionTitle}>Other Bookings</Text>
            {otherBookings.length > 0 ? (
                otherBookings.map((item) => (
                    <View key={item.bookingId} style={styles.listItemContainer}>
                        <View style={styles.listItem}>
                            <View style={styles.listIconContainer}>
                                <MaterialCommunityIcons name="car-connected" size={24} color="#64748b" />
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={styles.listLocation} numberOfLines={1}>
                                    {item.pickUpLocation} → {item.dropLocation}
                                </Text>
                                <Text style={styles.listDetails}>
                                    {formatDate(item.pickUpTime)} • {item.numberOfPeople} Pax
                                </Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={styles.listPrice}>
                                    ₹{item.price ? Number(item.price).toFixed(2) : '0.00'}
                                </Text>
                                <Text style={[styles.listStatusText, { color: statusColors[item.status]?.text }]}>
                                    {item.status}
                                </Text>
                            </View>
                        </View>

                        {canCancel(item.status) && (
                            <TouchableOpacity
                                style={[styles.listCancelButton, cancelCarPickupBookingLoading && { opacity: 0.6 }]}
                                onPress={() => handleCancel(item.id)}
                                disabled={cancelCarPickupBookingLoading}
                            >
                                <MaterialCommunityIcons name="close-circle-outline" size={16} color="#e11d48" />
                                <Text style={styles.listCancelButtonText}>
                                    {cancelCarPickupBookingLoading ? "Processing..." : "Cancel Booking"}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ))
            ) : (
                <Text style={styles.emptyTextSub}>No previous history</Text>
            )}
        </View>
    );
};

const InfoItem = ({ icon, iconColor, label, value }) => (
    <View style={styles.infoItem}>
        <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
        <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{value || "—"}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        width: width * 0.92,
        marginTop: 15,
        alignSelf: 'center',
    },
    loadingContainer: {
        marginTop: 50,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#64748b',
        fontSize: 14,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0f172a',
    },
    headerSub: {
        fontSize: 11,
        color: '#94a3b8',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    mapContainer: {
        height: 140,
        width: '100%',
        backgroundColor: '#e2e8f0',
    },
    map: {
        flex: 1,
    },
    cardBody: {
        padding: 16,
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    infoItem: {
        flexDirection: 'row',
        width: '50%',
        marginBottom: 16,
        paddingRight: 5,
    },
    infoLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoValue: {
        fontSize: 13,
        color: '#334155',
        fontWeight: '600',
        marginTop: 1,
    },
    cancelButton: {
        backgroundColor: '#fff1f2',
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 5,
        borderWidth: 1,
        borderColor: '#ffe4e6',
    },
    cancelButtonText: {
        color: '#e11d48',
        fontWeight: '700',
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 25,
        marginBottom: 12,
        color: '#1e293b',
    },
    listItemContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    listItem: {
        flexDirection: 'row',
        padding: 14,
        alignItems: 'center',
    },
    listIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    listLocation: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
    },
    listDetails: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 3,
    },
    listPrice: {
        fontWeight: '700',
        fontSize: 15,
        color: '#0f172a',
    },
    listStatusText: {
        fontSize: 10,
        fontWeight: '700',
        marginTop: 2,
    },
    listCancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        backgroundColor: '#fff1f2',
        borderTopWidth: 1,
        borderTopColor: '#ffe4e6',
    },
    listCancelButtonText: {
        color: '#e11d48',
        fontWeight: '700',
        fontSize: 12,
        marginLeft: 6,
    },
    noBooking: {
        padding: 40,
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 20,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#cbd5e1',
    },
    emptyText: {
        color: '#94a3b8',
        marginTop: 12,
        fontWeight: '600',
    },
    emptyTextSub: {
        textAlign: 'center',
        color: '#cbd5e1',
        fontSize: 13,
        marginTop: 10,
    }
});

export default MyCarPickupBookings;