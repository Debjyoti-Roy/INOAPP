import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Pressable,
  ScrollView,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import * as SecureStore from "expo-secure-store";
import Carousel from "react-native-reanimated-carousel";
import { getPackages } from "../../Redux/carPackageSlice";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const CarRecentSearch = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { packages } = useSelector((state) => state.car);
  const [carPackages, setCarPackages] = useState([]);

  useEffect(() => {
    const job = async () => {
      const carsString = await SecureStore.getItemAsync("carSearchroute");
      const cars = carsString ? JSON.parse(carsString) : null;

      if (!cars) return;

      const [day, month] = cars.travelDate.split("-");
      dispatch(getPackages({ area: cars.location, month: month }));
    };

    job();
  }, []);

  useEffect(() => {
    if (packages?.length) {
      setCarPackages(packages);
    }
  }, [packages]);

  const handleBookNow = (pkg) => {
    console.log(pkg)
    const data={
      id:pkg.id,
      travelDate:pkg.travelDate
    }
    navigation.navigate("CarPackageDetails", { carPackage: data });
    // navigation.navigate("CarPackageDetails", {
    //   id: pkg.id,
    //   travelDate: pkg.travelDate,
    // });
  };

  const renderCard = (pkg) => (
    <View style={styles.card}>
      {/* Thumbnail */}
      <Image source={{ uri: pkg.thumbnailUrl }} style={styles.image} />

      <View style={styles.details}>
        {/* Title */}
        <Text style={[styles.title,{color:"#000"}]} numberOfLines={1}>
          {pkg.title}
        </Text>

        {/* Description */}
        <Text style={[styles.description,{color:"#000"}]} numberOfLines={4}>
          {pkg.description}
        </Text>

        {/* Accommodation */}
        <View style={styles.row}>
          <Text style={styles.label}>Accommodation:</Text>
          <Text style={styles.value}>{pkg.hotelType || "Standard"}</Text>
        </View>

        {/* Transportation */}
        <View style={styles.row}>
          <Text style={styles.label}>Transportation:</Text>
          <Text style={styles.value}>{pkg.carTypes || "Comfort"}</Text>
        </View>

        {/* Price & Button */}
        <View style={styles.bottomRow}>
          <Text style={[styles.price,{color:"#000"}]}>₹{pkg.price.toLocaleString("en-IN")}</Text>

          <Pressable style={styles.button} onPress={() => handleBookNow(pkg)}>
            <Text style={styles.buttonText}>Book Now →</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{
      marginTop: 20, alignItems: "center",
      justifyContent: "center"
    }}>
      <Text style={{
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 12,
        alignSelf: "flex-start",
        color:"#000"
      }}>
        Recent Car Packages
      </Text>
      <Carousel
        width={width * 0.9}
        height={430}
        data={carPackages}
        renderItem={({ item }) => renderCard(item)}
        scrollAnimationDuration={800}
        modeConfig={{ parallaxScrollingOffset: 50 }}
        autoPlay
        autoPlayInterval={3500}
      />
    </View>
  );
};

export default CarRecentSearch;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
    height: 430,
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
    color: "#666",
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
