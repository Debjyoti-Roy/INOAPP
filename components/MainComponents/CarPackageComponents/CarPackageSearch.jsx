import {
    StyleSheet, Text, TouchableOpacity, View, Animated,
    Dimensions,
    Pressable,
    FlatList,
    Image,
    ActivityIndicator,
    PanResponder,
} from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Svg, { Path } from "react-native-svg";
import { DatePickerModal, ro } from "react-native-paper-dates";
import { getPackages } from '@/components/Redux/carPackageSlice';
import * as SecureStore from "expo-secure-store";

const FilterSection = ({ onClose, onApply, filters, setFilters }) => {
    const translateY = useRef(new Animated.Value(600)).current; // start hidden

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 5,
            onPanResponderMove: (_, gesture) => {
                if (gesture.dy > 0) translateY.setValue(gesture.dy);
            },
            onPanResponderRelease: (_, gesture) => {
                if (gesture.dy > 100) {
                    Animated.timing(translateY, {
                        toValue: 600,
                        duration: 200,
                        useNativeDriver: true,
                    }).start(onClose);
                } else {
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    useEffect(() => {
        // open animation
        Animated.timing(translateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, []);

    const carTypes = ["HATCHBACK", "SEDAN", "SUV", "TEMPO TRAVELLER", "MINI BUS"];

    const toggleType = (type) => {
        setFilters((prev) => ({
            ...prev,
            selectedCarTypes: prev.selectedCarTypes.includes(type)
                ? prev.selectedCarTypes.filter((t) => t !== type)
                : [...prev.selectedCarTypes, type],
        }));
    };

    const adjustDuration = (change) => {
        setFilters((prev) => ({
            ...prev,
            duration: Math.max(0, (prev.duration ?? 0) + change),
        }));
    };

    const handleApply = () => {
        onApply(filters);

        Animated.timing(translateY, {
            toValue: 600,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            // ✅ run onClose AFTER animation finishes
            requestAnimationFrame(() => {
                onClose();
            });
        });
    };

    return (
        <Animated.View
            {...panResponder.panHandlers}
            style={[
                filterStyles.sheetContainer,
                { transform: [{ translateY }] },
            ]}
        >
            <View style={filterStyles.handleBar} />
            <Text style={filterStyles.title}>Filters</Text>

            {/* Duration */}
            <View style={filterStyles.section}>
                <Text style={filterStyles.sectionTitle}>Duration</Text>
                <View style={filterStyles.durationRow}>
                    <TouchableOpacity
                        onPress={() => adjustDuration(-1)}
                        style={filterStyles.circleBtn}
                    >
                        <Text style={filterStyles.circleText}>–</Text>
                    </TouchableOpacity>
                    <Text style={filterStyles.durationText}>
                        {filters.duration === 0
                            ? "Not selected"
                            : `${filters.duration} Day${filters.duration > 1 ? "s" : ""
                            }`}
                    </Text>
                    <TouchableOpacity
                        onPress={() => adjustDuration(1)}
                        style={filterStyles.circleBtn}
                    >
                        <Text style={filterStyles.circleText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Tour Types */}
            <View style={filterStyles.section}>
                <Text style={filterStyles.sectionTitle}>Car Type</Text>
                {carTypes.map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={filterStyles.checkboxRow}
                        onPress={() => toggleType(type)}
                    >
                        <View
                            style={[
                                filterStyles.checkbox,
                                filters.selectedCarTypes.includes(type) &&
                                filterStyles.checkedBox,
                            ]}
                        />
                        <Text style={filterStyles.checkboxLabel}>{type}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                style={filterStyles.applyBtn}
                onPress={handleApply}
            >
                <Text style={filterStyles.applyText}>Apply Filters</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const CarPackageSearch = ({ route, navigation }) => {
    const dispatch = useDispatch();
    const handleBack = () => navigation.goBack();
    const animatedHeight = useRef(new Animated.Value(0)).current;
    const [packageDate, setPackageDate] = useState(() => {
        if (!myData?.travelDate) return new Date(); // fallback
        const [day, month, year] = myData.travelDate.split('-').map(Number);
        return new Date(year, month - 1, day); // JS Date uses 0-based months
    });
    const [expanded, setExpanded] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [sortOption, setSortOption] = useState("");
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [applyFilter, setApplyFilter] = useState(false)
    const { packages, packagesLoading, packagesError, packagesStatus } = useSelector((state) => state.car)
    const [filters, setFilters] = useState({
        selectedCarTypes: [],
        duration: 0,
    });
    const { myData } = route.params;
    useEffect(() => {
        const job = async () => {
            await SecureStore.setItemAsync("carSearchroute", JSON.stringify(myData));
        }
        job()
    }, [myData])
    const formatToDDMMYYYY = (isoString) => {
        if (!isoString) return "";

        const date = new Date(isoString);
        if (isNaN(date)) return "";

        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    };
    const handleSearch = () => {
        // console.log("SEARCHING>>>")
        const date = formatToDDMMYYYY(packageDate)
        const data = {
            location: myData.location,
            travelDate: date
        }
        // console.log(data)
        navigation.navigate("carPackageSearch", { myData: data });
    }
    const toggleExpand = () => {
        const toValue = expanded ? 0 : 150;
        setExpanded(!expanded);
        Animated.timing(animatedHeight, {
            toValue,
            duration: 300,
            useNativeDriver: false,
        }).start();
    };
    const handleApplyFilters = (newFilters) => {
        console.log("Applied Filters:", newFilters);
        // You can call your filter logic here (filter packages)
        setApplyFilter(!applyFilter)
        setShowFilterModal(false);
    };

    useEffect(() => {
        //   console.log(myData)
        const job = () => {
            const [day, month, year] = myData.travelDate.split("-");
            // dispatch(getPackages({ area: myData.location, month: month }))
            const appfilters = filters.selectedCarTypes
            if (filters.duration !== "" || appfilters.length) {
                dispatch(getPackages({ area: myData.location, month: month, catTypes: filters.selectedCarTypes, duration: filters.duration }))
            } else {
                dispatch(getPackages({ area: myData.location, month: month }))
            }
        }
        job()
    }, [myData, applyFilter])

    const sortedPackages = React.useMemo(() => {
        if (!packages) return [];
        const hotels = [...packages];
        if (sortOption === "lowToHigh")
            return hotels.sort((a, b) => a.price - b.price);
        if (sortOption === "highToLow")
            return hotels.sort((a, b) => b.price - a.price);
        return hotels;
    }, [packages, sortOption]);

    const handleViewDetails = (id) => {
        const data = {
            id: id,
            travelDate: myData.travelDate
        }
        // console.log(data)
        navigation.navigate("CarPackageDetails", { carPackage: data });
    }

    const renderPackageCard = ({ item }) => (
        <View style={list.packageCard}>
            <View style={list.imageContainer}>
                <Image
                    source={{ uri: item.thumbnailUrl }}
                    style={list.image}
                    resizeMode="cover"
                />
            </View>

            <View style={list.infoContainer}>
                <Text style={list.packageTitle}>{item.title}</Text>
                <Text style={list.packageDescription} numberOfLines={3}>
                    {item.description}
                </Text>

                <View style={list.rowBetween}>
                    <Text style={list.duration}>
                        🗓️ {item.durationDays} Days
                    </Text>
                    <Text style={list.price}>
                        ₹{item.price}
                        <Text style={list.perPerson}> /person</Text>
                    </Text>
                </View>

                <TouchableOpacity
                    style={list.bookButton}
                    onPress={() => handleViewDetails(item.id)}
                >
                    <Text style={list.bookText}>View Details</Text>
                </TouchableOpacity>
            </View>
        </View>
    );


    useEffect(() => {
        console.log(packages)
    }, [packages])

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
                            {packageDate.toDateString()}
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
            <Animated.View style={[styles.animatedBox, { height: animatedHeight }]}>
                {expanded && (
                    <>
                        <Text style={styles.label}>Dates</Text>
                        <TouchableOpacity
                            style={styles.input}
                            onPress={() => setShowPicker(true)}
                        >
                            <Text style={{ color: "#000" }}>
                                {packageDate
                                    ? `${packageDate.toDateString()}`
                                    : "Select date"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
                            <Text style={styles.searchBtnText}>Search</Text>
                        </TouchableOpacity>
                    </>
                )}
            </Animated.View>
            <View style={styles.bottomBar}>
                <TouchableOpacity onPress={() => setShowFilterModal(true)}>
                    <Text style={[styles.dropdownLabel, { color: "#000" }]}>Filter</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSortOption(sortOption === "lowToHigh" ? "highToLow" : "lowToHigh")}>
                    <Text style={[styles.dropdownLabel, { color: "#000" }]}>Sort By: {sortOption === "lowToHigh" ? "Low → High" : sortOption === "highToLow" ? "High → Low" : "None"}</Text>
                </TouchableOpacity>
            </View>
            <DatePickerModal
                locale="en"
                mode="single"
                visible={showPicker}
                label="Select Travel Date"
                onDismiss={() => setShowPicker(false)}
                date={packageDate}
                onConfirm={(date) => {
                    setPackageDate(date.date);
                    setShowPicker(false);
                }}
                calendarTheme={{
                    colors: {
                        surfaceVariant: '#bbdefb',  // Solid light blue
                        onSurfaceVariant: '#1976D2', // Optional: text color inside
                    },
                }}
            />
            {packagesLoading ? (
                <ActivityIndicator size="large" color="#0077CC" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={sortedPackages}
                    renderItem={renderPackageCard}
                    keyExtractor={(item) => item.id.toString()}
                    ListHeaderComponent={() => (
                        <Text style={list.locationText2}>
                            Showing Tour Packages in{" "}
                            <Text style={list.locationHighlight}>{myData.location}</Text>
                        </Text>
                    )}
                    contentContainerStyle={{
                        padding: 10,
                        paddingBottom: 100,
                    }}
                />
            )}
            {showFilterModal && (
                <FilterSection
                    onClose={() => setShowFilterModal(false)}
                    onApply={handleApplyFilters}
                    filters={filters}
                    setFilters={setFilters}
                />
            )}
        </View>
    )
}

export default CarPackageSearch

const filterStyles = StyleSheet.create({
    sheetContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        elevation: 20,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 10,
        transform: [{ translateY: 600 }],
    },
    handleBar: {
        width: 50,
        height: 5,
        backgroundColor: "#ccc",
        alignSelf: "center",
        borderRadius: 5,
        marginBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#111",
        textAlign: "center",
        marginBottom: 15,
    },
    section: { marginBottom: 20 },
    sectionTitle: { fontWeight: "600", color: "#333", marginBottom: 10 },
    durationRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
    },
    circleBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#ccc",
        justifyContent: "center",
        alignItems: "center",
    },
    circleText: { fontSize: 18, color: "#333" },
    durationText: { fontSize: 16, color: "#333" },
    checkboxRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: "#0077CC",
        borderRadius: 4,
        marginRight: 10,
    },
    checkedBox: { backgroundColor: "#0077CC" },
    checkboxLabel: { color: "#333", fontSize: 15 },
    applyBtn: {
        backgroundColor: "#0077CC",
        borderRadius: 10,
        paddingVertical: 12,
        marginTop: 10,
    },
    applyText: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 16,
    },
});

const list = StyleSheet.create({
    packageCard: {
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
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    infoContainer: {
        padding: 15,
    },
    packageTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#222",
        marginBottom: 5,
    },
    packageDescription: {
        color: "#555",
        fontSize: 14,
        marginBottom: 10,
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    duration: {
        color: "#0369A1",
        fontWeight: "600",
    },
    price: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#0077CC",
    },
    perPerson: {
        color: "#777",
        fontSize: 12,
    },
    bookButton: {
        backgroundColor: "#0077CC",
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 20,
        alignSelf: "flex-end",
        marginTop: 12,
    },
    bookText: {
        color: "#fff",
        fontWeight: "bold",
    },
    locationText2: {
        color: "#000000ff",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        marginTop: 10,
    },
    locationHighlight: { textTransform: "capitalize" },
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
    leftSection: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    backBtn: {
        marginRight: 5,
        padding: 2,
    },
    locationText: { color: "#fff", fontSize: 16, fontWeight: "bold" }, locationText2: {
        color: "#000000ff",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        marginTop: 10,
    },
    detailsText: { color: "#E0F2FE", fontSize: 13, marginTop: 4 },
    locationHighlight: { textTransform: "capitalize" },
    editBtn: {
        borderRadius: 20,
        padding: 8,
    },
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
})