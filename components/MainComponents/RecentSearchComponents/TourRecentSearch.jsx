import React, { useEffect } from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    Dimensions,
    Pressable,
    ScrollView,
    FlatList,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useDispatch, useSelector } from "react-redux";
import * as SecureStore from "expo-secure-store";
import { getTourPackages } from "../../Redux/tourPackageSlice";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.75;     // 3/4th of screen
const CARD_SPACING = 8;              // gap between cards
const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING; // snap distance

const TourRecentSearch = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const { packages } = useSelector((state) => state.tour);

    useEffect(() => {
        const job = async () => {
            const packagesString = await SecureStore.getItemAsync("tourSearchroute");
            const saved = packagesString ? JSON.parse(packagesString) : null;
            if (!saved) return;
            
            // Ensure travelDate exists before splitting
            if (saved.travelDate) {
                const parts = saved.travelDate.split("-");
                const month = parts[1]; 
                dispatch(getTourPackages({ area: saved.location, month }));
            }
        };
        job();
    }, [dispatch]);

    const handleBookNow = async (id) => {
        const packagesString = await SecureStore.getItemAsync("tourSearchroute");
        const saved = packagesString ? JSON.parse(packagesString) : null;
        
        const tourPackage = {
            id,
            travelDate: saved?.travelDate,
        };
        navigation.navigate("tourdetails", { tourPackage });
    };

    const isSingleItem = packages?.length === 1;
    
    // If single: Full width minus the list's horizontal padding
    // If multiple: The 75% width for the carousel effect
    const dynamicCardWidth = isSingleItem ? (width * 0.90) : CARD_WIDTH;

    // FIX: Added { item } destructuring here
    const renderCard = ({ item }) => (
        <View style={[styles.cardContainer, { width: dynamicCardWidth }]}>
            <View style={styles.imageWrapper}>
                <Image
                    source={{ uri: item.thumbnailUrl }}
                    style={styles.image}
                    resizeMode="cover"
                />
            </View>
            <View style={styles.content}>
                <Text style={[styles.title, { color: "#000" }]} numberOfLines={1}>
                    {item.title}
                </Text>

                <Text style={styles.description} numberOfLines={2}>
                    {item.description}
                </Text>
                
                <Text style={styles.duration}>
                    <Text style={{ color: "#000" }}>Duration: </Text>
                    <Text style={{ color: "#555" }}>
                        {item.durationDays
                            ? `${item.durationDays} Days / ${item.durationDays - 1} Nights`
                            : "N/A"}
                    </Text>
                </Text>

                <View style={styles.row}>
                    <Text style={[styles.label, { color: "#000" }]}>Accommodation:</Text>
                    <Text style={styles.value} numberOfLines={1}>{item.hotelType || "Standard"}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={[styles.label, { color: "#000" }]}>Transportation:</Text>
                    <Text style={styles.value} numberOfLines={1}>{item.carTypes || "Comfort"}</Text>
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.price, { color: "#000" }]}>₹{item.price?.toLocaleString("en-IN")}</Text>
                    <Pressable
                        style={styles.button}
                        onPress={() => handleBookNow(item.id)}
                    >
                        <Text style={styles.buttonText}>Book Now →</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>
                Recent Tour Packages
            </Text>
            
            <FlatList
                data={packages}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderCard}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                snapToInterval={SNAP_INTERVAL}
                decelerationRate="fast"
                snapToAlignment="start"
                disableIntervalMomentum
            />
        </View>
    );
};

// const TourRecentSearch = () => {
//     const dispatch = useDispatch();
//     const navigation = useNavigation();

//     const { packages, loading, error } = useSelector((state) => state.tour);


//     useEffect(() => {
//         const job = async () => {
//             const packagesString = await SecureStore.getItemAsync("tourSearchroute");
//             const saved = packagesString ? JSON.parse(packagesString) : null;
//             if (!saved) return;
//             const [day, month] = saved.travelDate.split("-");
//             dispatch(getTourPackages({ area: saved.location, month }));
//         };
//         job();
//     }, []);

//     const handleBookNow = async (id) => {
//         const packagesString = await SecureStore.getItemAsync("tourSearchroute");
//         const saved = packagesString ? JSON.parse(packagesString) : null;
//         const tourPackage = {
//             id,
//             travelDate: saved.travelDate,
//         }
//         navigation.navigate("tourdetails", {
//             tourPackage
//         });
//     };

//     const renderCard = ({item}) => (
//         <View style={styles.cardContainer}>
//             {/* Image */}
//             <View style={styles.imageWrapper}>
//                 <Image
//                     source={{ uri: item.thumbnailUrl }}
//                     style={styles.image}
//                     resizeMode="cover"
//                 />
//             </View>
//             {/* Content */}
//             <View style={styles.content}>
//                 <Text style={[styles.title, { color: "#000" }]} numberOfLines={1}>
//                     {item.title}
//                 </Text>

//                 <Text style={styles.description} numberOfLines={3}>
//                     {item.description}
//                 </Text>
//                 <Text style={styles.duration}>
//                     <Text style={{ color: "#000" }}>

//                         Duration:{" "}
//                     </Text>
//                     <Text style={{ color: "#555" }}>
//                         {item.durationDays
//                             ? `${item.durationDays} Days / ${item.durationDays - 1} Nights`
//                             : "N/A"}
//                     </Text>
//                 </Text>
//                 <View style={[styles.row, { color: "#000" }]}>
//                     <Text style={[styles.label, { color: "#000" }]}>Accommodation:</Text>
//                     <Text style={[styles.value, { color: "#000" }]}>{item.hotelType || "Standard"}</Text>
//                 </View>

//                 <View style={styles.row}>
//                     <Text style={[styles.label, { color: "#000" }]}>Transportation:</Text>
//                     <Text style={styles.value}>{item.carTypes || "Comfort"}</Text>
//                 </View>

//                 {/* Price + Button */}
//                 <View style={styles.footer}>
//                     <Text style={[styles.price, { color: "#000" }]}>₹{item.price}</Text>

//                     <Pressable
//                         style={styles.button}
//                         onPress={() => handleBookNow(item.id)}
//                     >
//                         <Text style={styles.buttonText}>Book Now →</Text>
//                     </Pressable>
//                 </View>
//             </View>
//         </View>
//     );

//     return (
//         <View style={{ marginTop: 20, alignItems: "center", justifyContent: "center" }}>
//             <Text style={{
//                 fontSize: 22,
//                 fontWeight: "700",
//                 marginBottom: 12,
//                 alignSelf: "flex-start",
//             }}>
//                 Recent Tour Packages
//             </Text>
//             {/* <Carousel
//                 width={width * 0.9}
//                 height={460}
//                 data={packages}
//                 renderItem={({ item }) => renderCard(item)}
//                 scrollAnimationDuration={800}
//                 autoPlay
//                 autoPlayInterval={3500}
//                 modeConfig={{ parallaxScrollingOffset: 50 }}
//             /> */}
//             <FlatList
//                             data={packages}
//                             keyExtractor={(item) => String(item.id)}
//                             renderItem={renderCard}
//                             horizontal
//                             showsHorizontalScrollIndicator={false}
//                             contentContainerStyle={styles.listContent}
//                             snapToInterval={SNAP_INTERVAL}       // snap per card
//                             decelerationRate="fast"
//                             snapToAlignment="start"
//                             disableIntervalMomentum
//                         />
//         </View>
//     );
// };

export default TourRecentSearch;

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        width:width
    },
    headerText: {
        color:"#000",
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 12,
        marginLeft: 16,
    },
     listContent: {
        paddingHorizontal: 16,           // left/right padding
    },
    cardContainer: {
        // width: packages.length>1?CARD_WIDTH:width,
        backgroundColor: "#fff",
        borderRadius: 25,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#ddd",
        height: 400,
        flexDirection: "column",
        marginRight: CARD_SPACING, 
    },
    imageWrapper: {
        height: 200,
        width: "100%",
        overflow: "hidden",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    content: {
        padding: 16,
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: "#666",
        marginBottom: 8,
    },
    duration: {
        fontSize: 14,
        fontWeight: "500",
        marginBottom: 10,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        width: 120,
    },
    value: {
        fontSize: 14,
        color: "#444",
    },
    footer: {
        marginTop: "auto",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    price: {
        fontSize: 18,
        fontWeight: "700",
    },
    button: {
        backgroundColor: "#2563eb",
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 10,
    },
    buttonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
});
