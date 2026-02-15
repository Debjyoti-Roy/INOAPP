// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   Dimensions,
//   Pressable,
// } from "react-native";
// import { useDispatch, useSelector } from "react-redux";
// import * as SecureStore from "expo-secure-store";
// import Carousel from "react-native-reanimated-carousel";
// import { getPackages } from "../../Redux/carPackageSlice";
// import { useNavigation } from "@react-navigation/native";

// const { width } = Dimensions.get("window");

// const CarRecentSearch = () => {
//   const dispatch = useDispatch();
//   const navigation = useNavigation();

//   const { packages } = useSelector((state) => state.car);
//   const [carPackages, setCarPackages] = useState([]);
//   const [secureStoreCars, setSecureStoreCars]=useState("")
//   useEffect(() => {
//     const job = async () => {
//       const carsString = await SecureStore.getItemAsync("carSearchroute");
//       const cars = carsString ? JSON.parse(carsString) : null;
//       console.log(cars)
//       setSecureStoreCars(cars.travelDate)
//       if (!cars) return;

//       const [day, month] = cars.travelDate.split("-");
//       dispatch(getPackages({ area: cars.location, month: month }));
//     };

//     job();
//   }, []);

//   useEffect(() => {
//     if (packages?.length) {
//       setCarPackages(packages);
//     }
//   }, [packages]);

//   const handleBookNow = (pkg) => {
//     const data={
//       id:pkg.id,
//       travelDate:secureStoreCars
//     }
//     navigation.navigate("CarPackageDetails", { carPackage: data });
//   };

//   const renderCard = (pkg) => (
//     <View style={styles.card}>
//       {/* Thumbnail */}
//       <Image source={{ uri: pkg.thumbnailUrl }} style={styles.image} />

//       <View style={styles.details}>
//         {/* Title */}
//         <Text style={[styles.title,{color:"#000"}]} numberOfLines={1}>
//           {pkg.title}
//         </Text>

//         {/* Description */}
//         <Text style={[styles.description,{color:"#000"}]} numberOfLines={4}>
//           {pkg.description}
//         </Text>

//         {/* Accommodation */}
//         <View style={styles.row}>
//           <Text style={styles.label}>Accommodation:</Text>
//           <Text style={styles.value}>{pkg.hotelType || "Standard"}</Text>
//         </View>

//         {/* Transportation */}
//         <View style={styles.row}>
//           <Text style={styles.label}>Transportation:</Text>
//           <Text style={styles.value}>{pkg.carTypes || "Comfort"}</Text>
//         </View>

//         {/* Price & Button */}
//         <View style={styles.bottomRow}>
//           <Text style={[styles.price,{color:"#000"}]}>₹{pkg.price.toLocaleString("en-IN")}</Text>

//           <Pressable style={styles.button} onPress={() => handleBookNow(pkg)}>
//             <Text style={styles.buttonText}>Book Now →</Text>
//           </Pressable>
//         </View>
//       </View>
//     </View>
//   );

//   return (
//     <View style={{
//       marginTop: 20, alignItems: "center",
//       justifyContent: "center"
//     }}>
//       <Text style={{
//         fontSize: 22,
//         fontWeight: "700",
//         marginBottom: 12,
//         alignSelf: "flex-start",
//         color:"#000"
//       }}>
//         Recent Car Packages
//       </Text>
//       <Carousel
//         width={width * 0.9}
//         height={430}
//         data={carPackages}
//         renderItem={({ item }) => renderCard(item)}
//         scrollAnimationDuration={800}
//         modeConfig={{ parallaxScrollingOffset: 50 }}
//         autoPlay
//         autoPlayInterval={3500}
//       />
//     </View>
//   );
// };

// export default CarRecentSearch;

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 25,
//     overflow: "hidden",
//     borderWidth: 1,
//     borderColor: "#ddd",
//     height: 430,
//   },
//   image: {
//     width: "100%",
//     height: 200,
//   },
//   details: {
//     padding: 16,
//     flex: 1,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginBottom: 4,
//   },
//   description: {
//     fontSize: 14,
//     color: "#666",
//     marginBottom: 10,
//   },
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 6,
//   },
//   label: {
//     fontWeight: "600",
//     color: "#333",
//   },
//   value: {
//     color: "#555",
//   },
//   bottomRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: "auto",
//     alignItems: "center",
//   },
//   price: {
//     fontSize: 18,
//     fontWeight: "700",
//   },
//   button: {
//     backgroundColor: "#1e40af",
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 10,
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "600",
//   },
// });
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
import { getPackages } from "../../Redux/carPackageSlice";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.75;      // 3/4th of screen width
const CARD_SPACING = 12;              // Gap between cards
const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING; 

const CarRecentSearch = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const { packages } = useSelector((state) => state.car);
    const [carPackages, setCarPackages] = useState([]);
    const [secureStoreCars, setSecureStoreCars] = useState("");

    useEffect(() => {
        const job = async () => {
            try {
                const carsString = await SecureStore.getItemAsync("carSearchroute");
                const cars = carsString ? JSON.parse(carsString) : null;
                
                if (!cars) return;

                setSecureStoreCars(cars.travelDate);

                // Ensure travelDate exists before trying to split it
                if (cars.travelDate) {
                    const [day, month] = cars.travelDate.split("-");
                    dispatch(getPackages({ area: cars.location, month: month }));
                }
            } catch (err) {
                console.log("Error fetching secure store for cars", err);
            }
        };

        job();
    }, [dispatch]);

    useEffect(() => {
        if (packages?.length) {
            setCarPackages(packages);
        }
    }, [packages]);

    const handleBookNow = (pkg) => {
        const data = {
            id: pkg.id,
            travelDate: secureStoreCars
        };
        navigation.navigate("CarPackageDetails", { carPackage: data });
    };

    const isSingleItem = carPackages?.length === 1;
    
    // If single: Full width minus the list's horizontal padding
    // If multiple: The 75% width for the carousel effect
    const dynamicCardWidth = isSingleItem ? (width * 0.90) : CARD_WIDTH;

    // Corrected to destructure { item } from FlatList
    const renderCard = ({ item }) => (
        // <View style={styles.card}>
        <View style={[styles.card, { width: dynamicCardWidth }]}>
            {/* Thumbnail */}
            <Image source={{ uri: item.thumbnailUrl }} style={styles.image} />

            <View style={styles.details}>
                {/* Title */}
                <Text style={[styles.title, { color: "#000" }]} numberOfLines={1}>
                    {item.title}
                </Text>

                {/* Description */}
                <Text style={[styles.description, { color: "#666" }]} numberOfLines={3}>
                    {item.description}
                </Text>

                {/* Info Rows */}
                <View style={styles.row}>
                    <Text style={styles.label}>Accommodation:</Text>
                    <Text style={styles.value}>{item.hotelType || "Standard"}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Transportation:</Text>
                    <Text style={styles.value}>{item.carTypes || "Comfort"}</Text>
                </View>

                {/* Price & Button */}
                <View style={styles.bottomRow}>
                    <Text style={[styles.price, { color: "#000" }]}>
                        ₹{item.price?.toLocaleString("en-IN")}
                    </Text>

                    <Pressable style={styles.button} onPress={() => handleBookNow(item)}>
                        <Text style={styles.buttonText}>Book Now →</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>
                Recent Car Packages
            </Text>
            
            <FlatList
                data={carPackages}
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

export default CarRecentSearch;

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
    },
    header: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 12,
        marginLeft: 16, // Align with the start of the list
        color: "#000"
    },
    listContent: {
        paddingHorizontal: 16, // Padding for the first and last cards
    },
    card: {
        // width: CARD_WIDTH,
        backgroundColor: "#fff",
        borderRadius: 25,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#ddd",
        height: 400,
        marginRight: CARD_SPACING,
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
    description: {
        fontSize: 14,
        marginBottom: 10,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    label: {
        fontWeight: "600",
        color: "#333",
    },
    value: {
        color: "#555",
    },
    bottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: "auto",
        alignItems: "center",
    },
    price: {
        fontSize: 18,
        fontWeight: "700",
    },
    button: {
        backgroundColor: "#1e40af",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
    },
});