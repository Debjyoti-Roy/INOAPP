import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    ActivityIndicator,
    Animated,
    Dimensions,
    Pressable,
    Modal,
    TextInput,
    PanResponder,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { DatePickerModal, ro } from "react-native-paper-dates";
import { searchHotels } from "@/components/Redux/hotelSlice";
import Svg, { Path } from "react-native-svg";
import Swiper from "react-native-swiper";
import * as SecureStore from "expo-secure-store";

const { width } = Dimensions.get("window");

const availableTags = [
    "Child Friendly",
    "Pet Friendly",
    "Group Friendly",
    "Solo Traveler Friendly",
    "Senior Citizen Friendly",
    "Family Friendly",
    "Couple Friendly",
    "Backpackers"
];

const availableAmenities = [
    { name: "Water Purifier" },
    { name: "Seating Area" },
    { name: "Bonfire Facility" },
    { name: "Wi-Fi" },
    { name: "Room Heater" },
    { name: "Hot Water" },
    { name: "CCTV Surveillance" },
    { name: "First Aid Kit" },
    { name: "Luggage Storage" },
    { name: "Reception" },
    { name: "Caretaker on Site" },
    { name: "Laundry Service" },
    { name: "Parking Facility" },
    { name: "Power Backup" },
    { name: "Room Service" },
    { name: "On-site Restaurant / Kitchen" },
];


const formattedDate = (dateString) => {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return "NOT_VALID"; // or return null / undefined based on your app's logic
    }

    // Add 1 day
    // date.setDate(date.getDate() + 1);

    // Format as YYYY-MM-DD
    const formattedDate = date.toISOString().split("T")[0];
    return formattedDate;
};

const SearchPage = ({ route, navigation }) => {
    const dispatch = useDispatch();
    const [page, setPage] = useState(0);
    const { searchResults, loading } = useSelector((state) => state.hotel);
    const { myData } = route.params;

    const [last, setLast] = useState(false)
    const [totalPages, setTotalPages] = useState()

    useEffect(() => {
        const job = async () => {
            console.log(myData)
            await SecureStore.setItemAsync("hotelSearchroute", JSON.stringify(myData));
        }
        job()
    }, [])


    useEffect(() => {
        // console.log(searchResults)
        setLast(searchResults?.last)
        setTotalPages(searchResults?.totalPages)
    }, [searchResults])


    const [range, setRange] = useState({
        startDate: new Date(myData?.startDate),
        endDate: new Date(myData?.endDate),
    });
    const [checkIn, setCheckIn] = useState(myData?.startDate);
    const [checkOut, setCheckOut] = useState(myData?.endDate);
    const [adults, setAdults] = useState(myData.adults);
    const [children, setChildren] = useState(myData.children);
    const [rooms, setRooms] = useState(myData?.rooms || 1);
    const [showDropdown, setShowDropdown] = useState(false);

    const [showPicker, setShowPicker] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [sortOption, setSortOption] = useState("");
    const [showFilterModal, setShowFilterModal] = useState(false);

    const [appliedFilters, setAppliedFilters] = useState({
        priceRange: { min: 0, max: 10000 },
        selectedTags: [],
        selectedAmenities: [],
    });
    const [filterCounter, setFilterCounter] = useState(false)
    const incrementRooms = (setter) => setter((prev) => Math.min(prev + 1, 5));
    const decrementRooms = (setter) => setter((prev) => Math.max(prev - 1, 1));

    const increment = (setter) => setter((prev) => Math.min(prev + 1, 20));
    const decrement = (setter) => setter((prev) => Math.max(prev - 1, 1));

    const animatedHeight = useRef(new Animated.Value(0)).current;

    const translateY = useRef(new Animated.Value(0)).current;

    // 👇 PanResponder for swipe down to dismiss
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return gestureState.dy > 5; // start detecting downward swipe
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    translateY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 100) {
                    // if user swipes down enough, close modal
                    Animated.timing(translateY, {
                        toValue: 600, // slide down out of screen
                        duration: 200,
                        useNativeDriver: true,
                    }).start(() => {
                        setShowFilterModal(false);
                        translateY.setValue(0);
                    });
                } else {
                    // else bounce back to original position
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    const toggleExpand = () => {
        const toValue = expanded ? 0 : 220;
        setExpanded(!expanded);
        Animated.timing(animatedHeight, {
            toValue,
            duration: 300,
            useNativeDriver: false,
        }).start();
    };

    useEffect(() => {
        dispatch(
            searchHotels({
                location: myData.location,
                checkIn: myData.startDate,
                checkOut: myData.endDate,
                requiredRoomCount: myData.rooms,
                page,
                size: 10,
                minPrice: appliedFilters.priceRange.min,
                maxPrice: appliedFilters.priceRange.max,
                tags: appliedFilters.selectedTags,
                amenities: appliedFilters.selectedAmenities,
            })
        );
    }, [myData, filterCounter, page]);

    const onConfirm = ({ startDate, endDate }) => {

        setRange({ startDate, endDate });
        setShowPicker(false);
        const addOneDay = (date) => {
            const d = new Date(date);
            d.setDate(d.getDate() + 1); // add 1 day
            return d;
        };

        console.log(addOneDay(startDate))

        setCheckIn(addOneDay(startDate));
        setCheckOut(addOneDay(endDate));

    };

    const handleBack = () => navigation.goBack();

    const isUTCString = (dateString) => {
        // Matches ISO UTC format like "2025-11-17T18:30:00.000Z"
        const isoUTCRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
        return typeof dateString === "string" && isoUTCRegex.test(dateString);
    };

    const handleSearch = () => {
        // Perform search or navigation
        const startDate = isUTCString(checkIn) ? formattedDate(checkIn) : checkIn;
        const endDate = isUTCString(checkOut) ? formattedDate(checkOut) : checkOut;
        const total = adults + children
        const mydata = {
            location: myData.location,
            startDate,
            endDate,
            rooms: rooms,
            total,
            adults,
            children
        }
        // console.log(mydata)
        toggleExpand()
        navigation.navigate("searchpage", { myData: mydata });
    };



    const sortedHotels = React.useMemo(() => {
        if (!searchResults?.content) return [];
        const hotels = [...searchResults.content];
        if (sortOption === "lowToHigh")
            return hotels.sort((a, b) => a.startingPrice - b.startingPrice);
        if (sortOption === "highToLow")
            return hotels.sort((a, b) => b.startingPrice - a.startingPrice);
        return hotels;
    }, [searchResults, sortOption]);

    //  const data = {
    //   room: state.rooms,
    //   location: state.location,
    //   checkIn: state.startDate,
    //   checkOut: state.endDate,
    //   id: id,
    //   total: state.total,
    //   startingPrice: startingPrice
    // }
    const handleDetailsPageRoute = (id, startingPrice) => {
        const data = {
            room: myData.rooms,
            location: myData.location,
            checkIn: myData.startDate,
            checkOut: myData.endDate,
            id,
            total: myData.total,
            startingPrice,
            adults,
            children
        }
        navigation.navigate("hoteldetailspage", { data });
    }


    const renderHotelCard = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.imageContainer}>
                <Swiper
                    autoplay
                    autoplayTimeout={3}
                    showsPagination={true}
                    dotStyle={styles.dot}
                    activeDotStyle={styles.activeDot}
                    loop
                >
                    {item.photoUrls && item.photoUrls.length > 0 ? (
                        item.photoUrls.map((url, index) => (
                            <Image
                                key={index}
                                source={{ uri: url }}
                                style={styles.image}
                                resizeMode="cover"
                            />
                        ))
                    ) : (
                        <Image
                            source={{
                                uri: "https://via.placeholder.com/400x300?text=No+Image",
                            }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    )}
                </Swiper>
            </View>

            <View style={styles.infoContainer}>
                <View style={styles.rowBetween}>
                    <Text style={styles.hotelName}>{item.name}</Text>
                    {item.available && (
                        <Text style={styles.availableBadge}>Available</Text>
                    )}
                </View>

                <Text style={styles.location}>
                    📍 {item.city}, {item.district} - {item.pincode}
                </Text>

                <View style={styles.tagsRow}>
                    {item.tags.map((tag, i) => (
                        <Text key={i} style={styles.tag}>
                            {tag}
                        </Text>
                    ))}
                    <Text style={styles.rating}>★★★★☆</Text>
                    <Text style={styles.ratingText}>Very Good</Text>
                </View>

                <Text
                    style={styles.description}
                    numberOfLines={3}
                    ellipsizeMode="tail"
                >
                    {item.description}
                </Text>

                <View style={styles.rowBetween}>
                    <Text style={styles.price}>
                        ₹{item.startingPrice}
                        <Text style={styles.night}> /night</Text>
                    </Text>
                    <TouchableOpacity
                        style={styles.bookButton}
                        onPress={() =>
                            // navigation.navigate("HotelDetails", { id: item.id })
                            handleDetailsPageRoute(item.id, item.startingPrice)
                        }
                    >
                        <Text style={styles.bookText}>Book Now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <View style={styles.leftSection}>
                    <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                        <Svg
                            xmlns="http://www.w3.org/2000/svg"
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

                    <View style={styles.headerLeft}>
                        <Text style={styles.locationText}>
                            <Text style={styles.locationHighlight}>{myData.location}</Text>
                        </Text>
                        <Text style={styles.detailsText}>
                            {new Date(myData.startDate).toDateString()} -{" "}
                            {new Date(myData.endDate).toDateString()} •{" "}
                            {adults + children} Guests • {rooms} Room
                            {rooms > 1 ? "s" : ""}
                        </Text>
                    </View>
                </View>

                {/* Edit button */}
                <TouchableOpacity style={styles.editBtn} onPress={toggleExpand}>
                    <Svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={20}
                        height={20}
                        viewBox="0 0 24 24"
                        fill="white"
                    >
                        <Path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 000-1.42l-2.34-2.34a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" />
                    </Svg>
                </TouchableOpacity>
            </View>



            {/* 🔽 Expandable Section */}
            <Animated.View style={[styles.animatedBox, { height: animatedHeight }]}>
                {expanded && (
                    <>
                        <Text style={styles.label}>Dates</Text>
                        <TouchableOpacity
                            style={styles.input}
                            onPress={() => setShowPicker(true)}
                        >
                            <Text style={{ color: "#000" }}>
                                {range.startDate && range.endDate
                                    ? `${range.startDate.toDateString()} - ${range.endDate.toDateString()}`
                                    : "Select dates"}
                            </Text>
                        </TouchableOpacity>

                        <Text style={styles.label}>Guests</Text>
                        <TouchableOpacity onPress={() => setShowDropdown(true)} style={styles.input}>
                            <Text style={{ color: "#000" }}>
                                {`${adults} Adults • ${children} Children • ${rooms} Rooms`}
                            </Text>
                        </TouchableOpacity>

                        <Modal
                            visible={showDropdown}
                            transparent
                            animationType="slide"
                            onRequestClose={() => setShowDropdown(false)}
                        >
                            {/* Dimmed overlay */}
                            <Pressable style={style3.overlay} onPress={() => setShowDropdown(false)} />

                            {/* Bottom sheet */}
                            <View style={style3.sheet}>
                                <Text style={style3.sheetTitle}>Select rooms and guests</Text>

                                {/* Rooms */}
                                <View style={style3.row}>
                                    <Text>Rooms</Text>
                                    <View style={style3.counter}>
                                        <TouchableOpacity onPress={() => decrementRooms(setRooms)} style={style3.roundButton}>
                                            <Text style={style3.btnText}>-</Text>
                                        </TouchableOpacity>
                                        <Text style={style3.count}>{rooms}</Text>
                                        <TouchableOpacity onPress={() => incrementRooms(setRooms)} style={style3.roundButton}>
                                            <Text style={style3.btnText}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Adults */}
                                <View style={style3.row}>
                                    <Text>Adults</Text>
                                    <View style={style3.counter}>
                                        <TouchableOpacity onPress={() => decrement(setAdults)} style={style3.roundButton}>
                                            <Text style={style3.btnText}>-</Text>
                                        </TouchableOpacity>
                                        <Text style={style3.count}>{adults}</Text>
                                        <TouchableOpacity onPress={() => increment(setAdults)} style={style3.roundButton}>
                                            <Text style={style3.btnText}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={style3.row}>
                                    <Text>Children</Text>
                                    <View style={style3.counter}>
                                        <TouchableOpacity onPress={() => decrement(setChildren)} style={style3.roundButton}>
                                            <Text style={style3.btnText}>-</Text>
                                        </TouchableOpacity>
                                        <Text style={style3.count}>{children}</Text>
                                        <TouchableOpacity onPress={() => increment(setChildren)} style={style3.roundButton}>
                                            <Text style={style3.btnText}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <TouchableOpacity style={style3.applyButton} onPress={() => setShowDropdown(false)}>
                                    <Text style={style3.applyText}>Apply</Text>
                                </TouchableOpacity>
                            </View>
                        </Modal>

                        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
                            <Text style={styles.searchBtnText}>Search</Text>
                        </TouchableOpacity>
                    </>
                )}
            </Animated.View>
            <View style={styles.bottomBar}>
                <TouchableOpacity onPress={() => setShowFilterModal(true)}>
                    <Text style={styles.dropdownLabel}>Filter</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSortOption(sortOption === "lowToHigh" ? "highToLow" : "lowToHigh")}>
                    <Text style={styles.dropdownLabel}>Sort By: {sortOption === "lowToHigh" ? "Low → High" : sortOption === "highToLow" ? "High → Low" : "None"}</Text>
                </TouchableOpacity>
            </View>
            <DatePickerModal
                locale="en"
                mode="range"
                visible={showPicker}
                onDismiss={() => setShowPicker(false)}
                startDate={range.startDate}
                endDate={range.endDate}
                onConfirm={onConfirm}
            />
            {loading ? (
                <ActivityIndicator size="large" color="#0077CC" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={sortedHotels}
                    renderItem={renderHotelCard}
                    keyExtractor={(item) => item.id.toString()}
                    ListHeaderComponent={() => (
                        <Text style={styles.locationText2}>
                            Showing Properties in{" "}
                            <Text style={styles.locationHighlight}>{myData.location}</Text>
                        </Text>
                    )}
                    contentContainerStyle={{
                        padding: 10,
                        paddingBottom: 100,
                    }}
                />
            )}
            {totalPages > 1 && (
                <View style={styles.paginationContainer}>
                    {/* Previous Button */}
                    <TouchableOpacity
                        style={[styles.pageButton, page === 0 && styles.disabledButton]}
                        disabled={page === 0}
                        onPress={() => setPage((prev) => Math.max(prev - 1, 0))}
                    >
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                            <Path
                                d="M15 18l-6-6 6-6"
                                stroke="#fff"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </Svg>
                    </TouchableOpacity>

                    {/* Page Indicator */}
                    <Text style={styles.pageIndicator}>
                        Showing page {page + 1} / {totalPages}
                    </Text>

                    {/* Next Button */}
                    <TouchableOpacity
                        style={[styles.pageButton, page + 1 === totalPages && styles.disabledButton]}
                        disabled={page + 1 === totalPages}
                        onPress={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                    >
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                            <Path
                                d="M9 6l6 6-6 6"
                                stroke="#fff"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </Svg>
                    </TouchableOpacity>
                </View>
            )}


            <Modal
                visible={showFilterModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowFilterModal(false)}
            >
                <Pressable
                    style={style3.overlay}
                    onPress={() => setShowFilterModal(false)}
                />
                <Animated.View
                    style={[style3.sheet, { transform: [{ translateY }] }]}
                    {...panResponder.panHandlers}
                >
                    <Text style={style3.sheetTitle}>Filters</Text>

                    {/* Price Range */}
                    <Text style={style3.label}>Price Range</Text>
                    <View style={style3.priceRangeRow}>
                        <TextInput
                            style={style3.priceInput}
                            keyboardType="numeric"
                            value={String(appliedFilters.priceRange.min)}
                            onChangeText={(val) =>
                                setAppliedFilters((prev) => ({
                                    ...prev,
                                    priceRange: { ...prev.priceRange, min: Number(val) || 0 },
                                }))
                            }
                            placeholder="Min"
                        />
                        <Text style={{ marginHorizontal: 5 }}>-</Text>
                        <TextInput
                            style={style3.priceInput}
                            keyboardType="numeric"
                            value={String(appliedFilters.priceRange.max)}
                            onChangeText={(val) =>
                                setAppliedFilters((prev) => ({
                                    ...prev,
                                    priceRange: { ...prev.priceRange, max: Number(val) || 0 },
                                }))
                            }
                            placeholder="Max"
                        />
                    </View>

                    {/* Tags */}
                    <Text style={style3.label}>Tags</Text>
                    <View style={style3.tagsContainer}>
                        {availableTags.map((tag) => (
                            <TouchableOpacity
                                key={tag}
                                style={[
                                    style3.tagButton,
                                    appliedFilters.selectedTags.includes(tag) && style3.tagSelected,
                                ]}
                                onPress={() =>
                                    setAppliedFilters((prev) => {
                                        const exists = prev.selectedTags.includes(tag);
                                        return {
                                            ...prev,
                                            selectedTags: exists
                                                ? prev.selectedTags.filter((t) => t !== tag)
                                                : [...prev.selectedTags, tag],
                                        };
                                    })
                                }
                            >
                                <Text
                                    style={[
                                        style3.tagText,
                                        appliedFilters.selectedTags.includes(tag) &&
                                        style3.tagTextSelected,
                                    ]}
                                >
                                    {tag}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Amenities */}
                    <Text style={style3.label}>Amenities</Text>
                    <View style={style3.tagsContainer}>
                        {availableAmenities.map((amenity) => (
                            <TouchableOpacity
                                key={amenity.name}
                                style={[
                                    style3.tagButton,
                                    appliedFilters.selectedAmenities.includes(amenity.name) &&
                                    style3.tagSelected,
                                ]}
                                onPress={() =>
                                    setAppliedFilters((prev) => {
                                        const exists = prev.selectedAmenities.includes(amenity.name);
                                        return {
                                            ...prev,
                                            selectedAmenities: exists
                                                ? prev.selectedAmenities.filter(
                                                    (a) => a !== amenity.name
                                                )
                                                : [...prev.selectedAmenities, amenity.name],
                                        };
                                    })
                                }
                            >
                                <Text
                                    style={[
                                        style3.tagText,
                                        appliedFilters.selectedAmenities.includes(amenity.name) &&
                                        style3.tagTextSelected,
                                    ]}
                                >
                                    {amenity.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Apply Button */}
                    <TouchableOpacity
                        style={style3.applyButton}
                        onPress={() => {
                            setShowFilterModal(false);
                            setFilterCounter(!filterCounter);
                        }}
                    >
                        <Text style={style3.applyText}>Apply Filters</Text>
                    </TouchableOpacity>
                </Animated.View>
            </Modal>

        </View>
    );
};

const style3 = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

    input: {
        padding: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        margin: 10,
    },
    inputText: {
        fontSize: 16,
    },

    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },

    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },

    sheetTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },

    counter: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    roundButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },

    btnText: {
        color: '#555',
        fontSize: 18,
        fontWeight: 'bold',
    },

    count: {
        fontSize: 16,
        marginHorizontal: 12,
        minWidth: 20,
        textAlign: 'center',
    },

    applyButton: {
        backgroundColor: '#0077CC',
        paddingVertical: 14,
        borderRadius: 8,
        marginTop: 20,
    },

    applyText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    priceRangeRow: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 10,
    },
    priceInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        padding: 8,
        textAlign: "center",
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 15,
        marginBottom: 5,
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    tagButton: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 6,
        margin: 4,
    },
    tagSelected: {
        backgroundColor: "#0077CC",
        borderColor: "#0077CC",
    },
    tagText: {
        color: "#000",
        fontSize: 12,
    },
    tagTextSelected: {
        color: "#fff",
    },

});


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },

    headerRow: {
        backgroundColor: "#0077CC",
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerLeft: { flex: 1 },
    locationText: { color: "#fff", fontSize: 16, fontWeight: "bold" }, locationText2: {
        color: "#000000ff",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        marginTop: 10,
        // textAlign: "center",
    },

    locationHighlight: { textTransform: "capitalize" },
    detailsText: { color: "#E0F2FE", fontSize: 13, marginTop: 4 },
    leftSection: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    backBtn: {
        marginRight: 5,
        padding: 2,
    },
    searchBtn: {
        backgroundColor: "#fff",
        borderRadius: 8,
        paddingVertical: 12,
        marginTop: 15,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
        // marginBottom:5
    },
    searchBtnText: {
        color: "#0077CC",
        fontWeight: "bold",
        fontSize: 16,
    },



    editBtn: {
        // backgroundColor: "#fff",
        borderRadius: 20,
        padding: 8,
        // elevation: 3,
    },
    pencilIcon: { fontSize: 18 },

    animatedBox: {
        backgroundColor: "#0077CC",
        overflow: "hidden",
        paddingHorizontal: 20,
    },
    label: { color: "#fff", marginTop: 10, fontWeight: "bold" },
    input: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 12,
        marginTop: 5,
    },

    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        marginBottom: 15,
        overflow: "hidden",
    },
    imageContainer: {
        width: "100%",
        height: 200,
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
    image: { width: "100%", height: "100%", resizeMode: "cover" },
    infoContainer: { padding: 15 },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    hotelName: { fontSize: 18, fontWeight: "bold", color: "#222" },
    availableBadge: {
        backgroundColor: "#D1FAE5",
        color: "#047857",
        fontWeight: "bold",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        fontSize: 12,
    },
    location: { color: "#555", marginTop: 4 },
    tagsRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
    tag: {
        backgroundColor: "#E0F2FE",
        color: "#0369A1",
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 3,
        marginRight: 6,
        fontSize: 12,
    },
    rating: { color: "#FACC15", fontWeight: "bold", marginLeft: 4 },
    ratingText: { color: "#555", marginLeft: 4 },
    description: { color: "#444", marginTop: 6, marginBottom: 5, fontSize: 14 },
    price: { fontSize: 18, fontWeight: "bold", color: "#0077CC", marginTop: 10 },
    night: { color: "#777", fontSize: 12 },
    bookButton: {
        backgroundColor: "#0077CC",
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 20,
        marginTop: 10
    },
    bookText: { color: "#fff", fontWeight: "bold" },
    bottomBar: {
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: "#f9fafb",
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: "#ddd",
    },
    dropdownLabel: { fontWeight: "bold" },
    paginationContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 10,
        backgroundColor: "#fff",
        borderTopWidth: 0.5,
        borderColor: "#ddd",
    },

    pageButton: {
        backgroundColor: "#0077CC",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        marginHorizontal: 10,
    },

    disabledButton: {
        backgroundColor: "#ccc",
    },

    pageButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },

    pageIndicator: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },


});

export default SearchPage;