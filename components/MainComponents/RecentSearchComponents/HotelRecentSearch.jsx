import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    Dimensions,
    Pressable,
    FlatList,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import * as SecureStore from "expo-secure-store";
import { searchHotels } from "../../Redux/hotelSlice";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.75;     // 3/4th of screen
const CARD_SPACING = 8;              // gap between cards
const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING; // snap distance

const HotelRecentSearch = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const { searchResults } = useSelector((state) => state.hotel);
    const [hotels, setHotels] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const hotelString = await SecureStore.getItemAsync("hotelSearchroute");
                const hotel = hotelString ? JSON.parse(hotelString) : null;

                if (hotel) {
                    dispatch(
                        searchHotels({
                            location: hotel.location,
                            checkIn: hotel.startDate,
                            checkOut: hotel.endDate,
                            requiredRoomCount: hotel.rooms,
                            page: 0,
                            size: 10,
                        })
                    );
                }
            } catch (err) {
                console.log("Error fetching hotel state", err);
            }
        })();
    }, [dispatch]);

    useEffect(() => {
        if (searchResults?.content) {
            setHotels(searchResults.content);
        }
    }, [searchResults]);

    const handleBookNow = async (id, startingPrice) => {
        const hotelString = await SecureStore.getItemAsync("hotelSearchroute");
        const stored = hotelString ? JSON.parse(hotelString) : null;

        const data = {
            room: stored.rooms,
            location: stored.location,
            checkIn: stored.startDate,
            checkOut: stored.endDate,
            id,
            total: stored.total,
            startingPrice,
            adults: stored.adults,
            children: stored.children,
        };

        navigation.navigate("hoteldetailspage", { data });
    };

    const renderCard = ({ item }) => (
        <View style={styles.card}>
            <Image
                source={{ uri: item.photoUrls?.[0] }}
                style={styles.image}
                resizeMode="cover"
            />

            <View style={styles.details}>
                <Text style={styles.title} numberOfLines={1}>
                    {item.name}
                </Text>

                <Text style={styles.location} numberOfLines={1}>
                    📍 {item.area}, {item.city}
                </Text>

                <Text style={styles.description} numberOfLines={3}>
                    {item.description}
                </Text>

                {item.tags?.length > 0 && (
                    <View style={styles.tagContainer}>
                        <Text style={styles.tag}>{item.tags[0]}</Text>
                    </View>
                )}

                <View style={styles.priceRow}>
                    <Text style={styles.price}>
                        ₹{item.startingPrice.toLocaleString("en-IN")}
                        <Text style={styles.night}> /night</Text>
                    </Text>

                    <Pressable
                        style={styles.button}
                        onPress={() => handleBookNow(item.id, item.startingPrice)}
                    >
                        <Text style={styles.buttonText}>View Details →</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Recent Hotels</Text>

            <FlatList
                data={hotels}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderCard}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                snapToInterval={SNAP_INTERVAL}       // snap per card
                decelerationRate="fast"
                snapToAlignment="start"
                disableIntervalMomentum
            />
        </View>
    );
};

export default HotelRecentSearch;

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
    },
    header: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 12,
        marginLeft: 16,
    },
    listContent: {
        paddingHorizontal: 16,           // left/right padding
    },
    card: {
        width: CARD_WIDTH,
        backgroundColor: "#fff",
        borderRadius: 25,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#ddd",
        height: 400,
        marginRight: CARD_SPACING,       // gap so next card peeks
    },
    image: {
        width: "100%",
        height: 200,
    },
    details: {
        padding: 16,
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 4,
    },
    location: {
        fontSize: 14,
        opacity: 0.7,
        marginBottom: 6,
    },
    description: {
        fontSize: 13,
        opacity: 0.7,
        marginBottom: 8,
    },
    tagContainer: {
        backgroundColor: "#DEF7E4",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        alignSelf: "flex-start",
        marginBottom: 10,
    },
    tag: {
        color: "#0a7d24",
        fontSize: 12,
        fontWeight: "600",
    },
    priceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: "auto",
        alignItems: "center",
    },
    price: {
        fontSize: 18,
        fontWeight: "700",
    },
    night: {
        fontSize: 12,
        opacity: 0.6,
    },
    button: {
        backgroundColor: "#1e40af",
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 10,
    },
    buttonText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "600",
    },
});