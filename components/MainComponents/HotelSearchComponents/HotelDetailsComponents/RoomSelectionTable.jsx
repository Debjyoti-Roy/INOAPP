import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

const RoomSelectionTable = ({
  hotelRooms,
  numberofDays,
  totalPeople,
  handleBookNow,
}) => {
  const [selectedRooms, setSelectedRooms] = useState({});
  const [imageIndexes, setImageIndexes] = useState({});

  const handleRoomChange = (roomId, value, maxAvailable) => {
    let num = parseInt(value, 10);
    if (isNaN(num) || num < 0) num = 0;
    if (num > maxAvailable) num = maxAvailable;
    setSelectedRooms((prev) => ({ ...prev, [roomId]: num }));
  };

  const handleNextImage = (roomId, total) => {
    setImageIndexes((prev) => ({
      ...prev,
      [roomId]: (prev[roomId] || 0) + 1 >= total ? 0 : (prev[roomId] || 0) + 1,
    }));
  };

  const handlePrevImage = (roomId, total) => {
    setImageIndexes((prev) => ({
      ...prev,
      [roomId]: (prev[roomId] || 0) - 1 < 0 ? total - 1 : (prev[roomId] || 0) - 1,
    }));
  };

  const summary = useMemo(() => {
    let totalCost = 0;
    let totalCapacity = 0;

    hotelRooms.forEach((room) => {
      const count = selectedRooms[room.id] || 0;
      totalCost += Number(room.pricePerNight) * Number(count) * Number(numberofDays);
      console.log("Total",numberofDays)
      totalCapacity += room.maxOccupancy * count;
    });

    return { totalCost, totalCapacity };
  }, [selectedRooms, hotelRooms, numberofDays]);

  const prepareBookingData = () => {
    const bookingData = [];
    hotelRooms.forEach((room) => {
      const count = selectedRooms[room.id] || 0;
      if (count > 0) {
        bookingData.push({ count, room });
      }
    });
    return bookingData;
  };

  const handleBookNow2 = () => {
    const bookingData = prepareBookingData();
    handleBookNow(bookingData);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Select Rooms to Book</Text>

      {hotelRooms.map((room) => {
        const selectedCount = selectedRooms[room.id] || 0;
        const currentIndex = imageIndexes[room.id] || 0;
        const totalImages = room.imageUrls.length;

        return (
          <View key={room.id} style={styles.card}>
            {/* Image Section */}
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: room.imageUrls[currentIndex] }}
                style={styles.image}
                resizeMode="cover"
              />

              {totalImages > 1 && (
                <>
                  <TouchableOpacity
                    style={[styles.navButton, { left: 10 }]}
                    onPress={() => handlePrevImage(room.id, totalImages)}
                  >
                    <Icon name="chevron-left" size={18} color="#333" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.navButton, { right: 10 }]}
                    onPress={() => handleNextImage(room.id, totalImages)}
                  >
                    <Icon name="chevron-right" size={18} color="#333" />
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Room Info */}
            <View style={styles.infoContainer}>
              <Text style={styles.roomName}>{room.name}</Text>

              <View style={styles.featureList}>
                {room.features.map((feature, i) => (
                  <Text key={i} style={styles.featureItem}>• {feature}</Text>
                ))}
              </View>

              <View style={styles.detailsBox}>
                <Text style={styles.detailText}>
                  <Text style={styles.bold}>Max Occupancy:</Text> {room.maxOccupancy}
                </Text>
                <Text style={styles.detailText}>
                  <Text style={styles.bold}>Available:</Text> {room.totalRooms}
                </Text>
                <Text style={styles.detailText}>
                  <Text style={styles.bold}>Price/Night:</Text> ₹{room.pricePerNight}
                </Text>
              </View>

              {/* Counter */}
              <View style={styles.counterContainer}>
                <TouchableOpacity
                  onPress={() =>
                    handleRoomChange(room.id, selectedCount - 1, room.totalRooms)
                  }
                  disabled={selectedCount <= 0}
                  style={[
                    styles.counterButton,
                    selectedCount <= 0 && styles.disabledButton,
                  ]}
                >
                  <Text style={[styles.counterText,{color:"#000"}]}>–</Text>
                </TouchableOpacity>

                <Text style={[styles.countDisplay,{color:"#000"}]}>{selectedCount}</Text>

                <TouchableOpacity
                  onPress={() =>
                    handleRoomChange(room.id, selectedCount + 1, room.totalRooms)
                  }
                  disabled={selectedCount >= room.totalRooms}
                  style={[
                    styles.counterButton,
                    selectedCount >= room.totalRooms && styles.disabledButton,
                  ]}
                >
                  <Text style={[styles.counterText,{color:"#000"}]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      })}

      {/* Summary Section */}
      <View style={styles.summaryBox}>
        <View>
          <Text style={styles.summaryText}>
            Total People Covered:{" "}
            <Text style={styles.bold}>{summary.totalCapacity}</Text>
          </Text>
          <Text style={styles.summaryText}>
            Booking for: <Text style={styles.bold}>{totalPeople}</Text>
          </Text>
          <Text style={styles.summaryText}>
            Number of Days: <Text style={styles.bold}>{numberofDays}</Text>
          </Text>
        </View>

        <View style={styles.summaryRight}>
          <Text style={styles.totalPrice}>Grand Total: ₹{summary.totalCost}</Text>
          <TouchableOpacity
            onPress={handleBookNow2}
            style={styles.reserveButton}
          >
            <Text style={styles.reserveButtonText}>Reserve Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default RoomSelectionTable;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f9fafb",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    elevation: 2,
  },
  imageContainer: {
    position: "relative",
    height: 180,
  },
  image: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  navButton: {
    position: "absolute",
    top: "50%",
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: 8,
    borderRadius: 20,
    transform: [{ translateY: -12 }],
  },
  infoContainer: {
    padding: 12,
  },
  roomName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2563eb",
    backgroundColor: "#e0f2fe",
    padding: 6,
    borderRadius: 8,
    marginBottom: 8,
    textAlign: "center",
  },
  featureList: {
    marginBottom: 8,
  },
  featureItem: {
    fontSize: 14,
    color: "#4b5563",
  },
  detailsBox: {
    backgroundColor: "#f3f4f6",
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  detailText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 2,
  },
  bold: {
    fontWeight: "700",
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  counterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#9ca3af",
    borderRadius: 6,
  },
  disabledButton: {
    borderColor: "#d1d5db",
    opacity: 0.5,
  },
  counterText: {
    fontSize: 18,
    fontWeight: "600",
  },
  countDisplay: {
    minWidth: 30,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
  summaryBox: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginTop: 16,
  },
  summaryText: {
    fontSize: 14,
    color: "#1f2937",
  },
  summaryRight: {
    marginTop: 10,
    alignItems: "center",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#16a34a",
    marginBottom: 6,
  },
  reserveButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  reserveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
