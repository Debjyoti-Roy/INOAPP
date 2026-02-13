import {
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Dimensions,
  Modal,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import React, { useEffect, useMemo, useState, useRef } from 'react'
import { fetchHotel } from '@/components/Redux/hotelSlice'
import { useDispatch } from 'react-redux'
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RoomSelectionTable from './HotelDetailsComponents/RoomSelectionTable'
import Svg, { Path } from "react-native-svg";
import { DatePickerModal, ro } from "react-native-paper-dates";
import * as SecureStore from "expo-secure-store";
import Toast from 'react-native-root-toast';
import Carousel from "react-native-reanimated-carousel";
import HotelCarousel from './HotelDetailsComponents/HotelCarousel'
import { encode as btoa, decode as atob } from "base-64";
import HotelShareButton from "./../ShareButtons/HotelShareButton"

const { width, height } = Dimensions.get('window');

const amenitiesList = [
  {
    id: 1,
    label: "On-site Restaurant / Kitchen",
    icon: (
      <Svg width={20} height={20} viewBox="0 0 512 512" fill="#000">
        <Path d="M416 0c-52.9 0-96 43.1-96 96v160c0 35.3-28.7 64-64 64s-64-28.7-64-64V96c0-52.9-43.1-96-96-96S0 43.1 0 96v320c0 52.9 43.1 96 96 96h320c52.9 0 96-43.1 96-96V96c0-52.9-43.1-96-96-96z" />
      </Svg>
    ),
  },
  {
    id: 2,
    label: "Room Service",
    icon: (
      <Svg width={20} height={20} viewBox="0 0 512 512" fill="#000">
        <Path d="M256 48c-114.9 0-208 93.1-208 208h416c0-114.9-93.1-208-208-208zM32 304v64h448v-64H32zm32 96v32h384v-32H64z" />
      </Svg>
    ),
  },
  {
    id: 3,
    label: "Power Backup",
    icon: (
      <Svg width={20} height={20} viewBox="0 0 384 512" fill="#000">
        <Path d="M192 0L0 288h160v224l192-288H192z" />
      </Svg>
    ),
  },
  {
    id: 4,
    label: "Parking Facility",
    icon: (
      <Svg width={20} height={20} viewBox="0 0 448 512" fill="#000">
        <Path d="M400 64H48C21.5 64 0 85.5 0 112v288c0 26.5 21.5 48 48 48h144v-96h-48v-64h64c70.7 0 128-57.3 128-128S278.7 64 208 64zM224 192h-80V128h80c35.3 0 64 28.7 64 64s-28.7 64-64 64z" />
      </Svg>
    ),
  },
  {
    id: 5,
    label: "Laundry Service",
    icon: (
      <Svg width={20} height={20} viewBox="0 0 512 512" fill="#000">
        <Path d="M416 64H96C60.7 64 32 92.7 32 128v256c0 35.3 28.7 64 64 64h320c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64zM256 384a96 96 0 1 1 0-192 96 96 0 0 1 0 192z" />
      </Svg>
    ),
  },
  {
    id: 6,
    label: "Caretaker on Site",
    icon: (
      <Svg width={20} height={20} viewBox="0 0 448 512" fill="#000">
        <Path d="M224 256A128 128 0 1 0 224 0a128 128 0 0 0 0 256zm89.6 32h-11.7c-22.2 10.2-46.9 16-73.9 16s-51.7-5.8-73.9-16h-11.7C63.5 288 0 351.5 0 430.4V480h448v-49.6c0-78.9-63.5-142.4-134.4-142.4z" />
      </Svg>
    ),
  },
  {
    id: 7,
    label: "Reception",
    icon: (
      <Svg width={20} height={20} viewBox="0 0 640 512" fill="#000">
        <Path d="M32 480h576V352H32V480zM480 64c0-17.7-14.3-32-32-32H192c-17.7 0-32 14.3-32 32V320h320V64z" />
      </Svg>
    ),
  },
  {
    id: 8,
    label: "Luggage Storage",
    icon: (
      <Svg width={20} height={20} viewBox="0 0 448 512" fill="#000">
        <Path d="M400 128h-80V80c0-26.5-21.5-48-48-48H176c-26.5 0-48 21.5-48 48v48H48c-26.5 0-48 21.5-48 48v256c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V176c0-26.5-21.5-48-48-48zM176 80h96v48h-96V80z" />
      </Svg>
    ),
  },
  {
    id: 9,
    label: "First Aid Kit",
    icon: (
      <Svg width={20} height={20} viewBox="0 0 512 512" fill="#000">
        <Path d="M448 64H64C28.7 64 0 92.7 0 128v320c0 35.3 28.7 64 64 64h384c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64zM352 320h-64v64h-64v-64h-64v-64h64v-64h64v64h64v64z" />
      </Svg>
    ),
  },
  {
    id: 10,
    label: "CCTV Surveillance",
    icon: (
      <Svg width={20} height={20} viewBox="0 0 640 512" fill="#000">
        <Path d="M633.8 458.1L457.5 355.3c-10.4-6-23.4-2.5-29.4 7.9l-25.5 43.9 58.3 33.8 25.5-43.9c6-10.4 19-13.9 29.4-7.9l176.3 102.8c10.4 6 13.9 19 7.9 29.4s-19 13.9-29.4 7.9zM384 64L0 256l128 74.3V448c0 35.3 28.7 64 64 64h192c35.3 0 64-28.7 64-64V330.3l128-74.3L384 64z" />
      </Svg>
    ),
  },
  {
    id: 11,
    label: "Hot Water",
    icon: (
      <Svg width={20} height={20} viewBox="0 0 384 512" fill="#000">
        <Path d="M192 0C107.5 0 48 128 48 224s59.5 224 144 224 144-128 144-224S276.5 0 192 0z" />
      </Svg>
    ),
  },
  {
    id: 12,
    label: "Room Heater",
    icon: (
      <Svg width={20} height={20} viewBox="0 0 512 512" fill="#000">
        <Path d="M256 32C132.3 32 32 132.3 32 256s100.3 224 224 224 224-100.3 224-224S379.7 32 256 32zM192 416v-96h128v96H192z" />
      </Svg>
    ),
  },
  {
    id: 13,
    label: "Wi-Fi",
    icon: (
      <Svg width={20} height={20} viewBox="0 0 640 512" fill="#000">
        <Path d="M320 384c-35.3 0-64 28.7-64 64s28.7 64 64 64 64-28.7 64-64-28.7-64-64-64zM0 192l64 64c141.4-141.4 370.6-141.4 512 0l64-64C432.9 12.9 207.1 12.9 0 192z" />
      </Svg>
    ),
  },
  {
    id: 14,
    label: "Bonfire Facility",
    icon: (
      <Svg width={20} height={20} viewBox="0 0 384 512" fill="#000">
        <Path d="M192 0C85.1 122.4 0 210.2 0 288c0 88.4 78.8 160 176 160s176-71.6 176-160c0-77.8-85.1-165.6-160-288z" />
      </Svg>
    ),
  },
  {
    id: 15,
    label: "Seating Area",
    icon: (
      <Svg width={20} height={20} viewBox="0 0 640 512" fill="#000">
        <Path d="M160 96H480V64c0-17.7-14.3-32-32-32H192c-17.7 0-32 14.3-32 32v32zM0 256V448H64V256H0zm576 0v192h64V256H576zM128 128V480H512V128H128z" />
      </Svg>
    ),
  },
  {
    id: 16,
    label: "Water Purifier",
    icon: (
      <Svg width={20} height={20} viewBox="0 0 384 512" fill="#000">
        <Path d="M192 0C86 0 0 114.6 0 256c0 97.2 78.8 176 176 176h32c97.2 0 176-78.8 176-176C384 114.6 298 0 192 0z" />
      </Svg>
    ),
  },
];


const allocateRooms_func = (rooms = [], totalPeople) => {
  if (rooms === undefined || !rooms.length) return null;
  console.log(rooms)
  console.log(totalPeople)
  const sortedRooms = [...rooms].sort((a, b) => b.maxOccupancy - a.maxOccupancy);
  let remainingPeople = totalPeople;
  const selectedMap = {};

  for (const room of sortedRooms) {
    let available = room.totalRooms;

    while (remainingPeople > 0 && available > 0) {
      if (!selectedMap[room.id]) {
        selectedMap[room.id] = { room, count: 1 };
      } else {
        selectedMap[room.id].count++;
      }
      remainingPeople -= room.maxOccupancy;
      available--;
    }

    if (remainingPeople <= 0) break;
  }

  return remainingPeople <= 0 ? Object.values(selectedMap) : null;
};
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

const HotelDetailsPage = ({ route, navigation }) => {
  const { data } = route.params
  let finalData = null;
  if (typeof data === "string") {
    const jsonString = atob(data);
    finalData = JSON.parse(jsonString);
  } else {
    finalData = data
  }
  const [hotel, setHotelData] = useState({});
  const [numberofDays, setnumberofDays] = useState()
  const [showFull, setShowFull] = useState(false);
  const [text, setText] = useState()
  const [amenities, setAmenititeslist] = useState([])
  const [nearbyAttractions, setNearbyAttractions] = useState([])
  const [showInfo, setShowInfo] = useState(false);
  const [showAbove, setShowAbove] = useState(false);
  const iconRef = useRef();
  const [checkIn, setCheckIn] = useState(finalData?.checkIn);
  const [checkOut, setCheckOut] = useState(finalData?.checkOut);
  const [range, setRange] = useState({
    startDate: new Date(finalData?.checkIn),
    endDate: new Date(finalData?.checkOut),
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [showGuestOptions, setShowGuestOptions] = useState(false);
  const [adults, setAdults] = useState(finalData.adults);
  const [children, setChildren] = useState(finalData.children);
  const [rooms, setRooms] = useState(1);
  const [hotelRooms, setHotelRooms] = useState([])
  const [imageUrls, setImageUrls] = useState([])

  const [bookingData, setBookingData] = useState(null);
  const [bookingData2, setBookingData2] = useState(null);
  const [showModal2, setShowModal2] = useState(false);


  //Booking
  const [bookingId, setBookingId] = useState("")
  const [razorpayId, setRazorpayId] = useState("")
  const [totalAmt, setTotalAmount] = useState("")
  const [bookingModal, setBookingModal] = useState(false)
  const [failModal, setFailModal] = useState(false)
  const [paidAt, setPaidAt] = useState("")
  const [tooltipPosition, setTooltipPosition] = useState("left");
  const [loading, setLoading] = useState(false)
  const carouselRef = useRef(null);
  const dispatch = useDispatch()
  useEffect(() => {
    // console.log(data)
    const job = async () => {
      setLoading(true)
      const htl = await dispatch(fetchHotel({ checkIn: finalData.checkIn, checkOut: finalData.checkOut, id: finalData.id }));
      console.log(htl)
      if (htl.payload && htl.payload.status == 200) {
        setLoading(false)
        setImageUrls(htl.payload.data?.imageUrls)
        setNearbyAttractions(htl.payload.data?.nearbyAttractions)
        setHotelRooms(htl.payload.data?.rooms)
        setAmenititeslist(htl.payload.data?.amenities)
        // setAdults(data.total)
        // setStartDate(data.checkIn)
        // setEndDate(data.checkOut)
        setHotelData(htl.payload.data);
        setText(htl.payload.data.about)
      } else {
      }
    }
    job()
  }, [finalData])

  let limit = 500

  const totalPeople = finalData?.total || 1;

  const filteredRooms = useMemo(() => {
    if (!hotel?.rooms || !finalData?.startingPrice) return hotel?.rooms || [];

    return hotel.rooms.filter(room => room.pricePerNight <= finalData.startingPrice);
  }, [hotel, finalData]);

  const allocatedRooms = useMemo(() => {
    if (!filteredRooms || !totalPeople) return [];

    const allocation = allocateRooms_func(filteredRooms, totalPeople)
      ?? allocateRooms_func(hotel.rooms, totalPeople);

    return allocation || [];
  }, [filteredRooms, totalPeople]);
  const grandTotal = allocatedRooms?.reduce(
    (acc, roomObj) => acc + roomObj.room.pricePerNight * roomObj.count,
    0
  );

  const totalAmount = grandTotal * numberofDays;

  const isLong = text?.length > limit;
  const displayedText = showFull ? text : text?.slice(0, limit);

  const getAmenityIcon = (name) => {
    const amenity = amenitiesList.find(
      item => item.label.trim().toLowerCase() === name.trim().toLowerCase()
    );
    return amenity ? amenity.icon : null;
  };


  useEffect(() => {
    // console.log("state in effect", currentState);
    if (finalData.checkIn && finalData.checkOut) {
      const checkIn = new Date(finalData.checkIn);
      const checkOut = new Date(finalData.checkOut);

      const diffTime = checkOut - checkIn;
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      // console.log(diffDays);

      setnumberofDays(diffDays)
    }
  }, [finalData]);

  const isUTCString = (dateString) => {
    // Matches ISO UTC format like "2025-11-17T18:30:00.000Z"
    const isoUTCRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    return typeof dateString === "string" && isoUTCRegex.test(dateString);
  };

  const handleSearch = () => {
    const startDate = isUTCString(checkIn) ? formattedDate(checkIn) : checkIn;
    const endDate = isUTCString(checkOut) ? formattedDate(checkOut) : checkOut;
    const total = adults + children
    const myData = {
      room: finalData.room,
      location: finalData.location,
      checkIn: startDate,
      checkOut: endDate,
      id: finalData.id,
      total: total,
      startingPrice: finalData.startingPrice,
      adults,
      children
    }
    navigation.navigate("hoteldetailspage", { data: myData });
  }

  const formatDate = (date) => date.toISOString().split("T")[0];


  const onConfirm = ({ startDate, endDate }) => {
    setRange({ startDate, endDate });
    setShowPicker(false);

    const addOneDay = (date) => {
      const d = new Date(date);
      d.setDate(d.getDate() + 1);
      return d;
    };

    const formattedCheckIn = formatDate(addOneDay(startDate));
    const formattedCheckOut = formatDate(addOneDay(endDate));

    console.log(formattedCheckIn, formattedCheckOut);

    setCheckIn(formattedCheckIn);
    setCheckOut(formattedCheckOut);
  };


  const incrementRooms = (setter) => setter((prev) => Math.min(prev + 1, 5));
  const decrementRooms = (setter) => setter((prev) => Math.max(prev - 1, 1));

  const increment = (setter) => setter((prev) => Math.min(prev + 1, 20));
  const decrement = (setter) => setter((prev) => Math.max(prev - 1, 1));

  const handleBook = async (rooms) => {
    const token = await SecureStore.getItemAsync("token");
    if (token) {
      const startDate = isUTCString(checkIn) ? formattedDate(checkIn) : checkIn;
      const endDate = isUTCString(checkOut) ? formattedDate(checkOut) : checkOut;
      const newBookingData = {
        roomBookings: rooms.map((item) => ({
          roomId: item.room.id,
          checkInDate: startDate,
          checkOutDate: endDate,
          numberOfRooms: item.count,
          numberOfGuests: finalData.total
        }))
      };
      console.log(newBookingData)
      navigation.navigate("hotelbill", { id: finalData.id, bookingData2: newBookingData, bookingData: rooms, numberOfDays: numberofDays, checkIn: startDate, checkOut: endDate, total: finalData.total });
    } else {
      navigation.navigate("Profile");
      let toast = Toast.show("Please Login First!", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
      });
      setTimeout(() => Toast.hide(toast), 2000);
    }
  }
  useEffect(() => {
    console.log(hotel)
    console.log(finalData)
  }, [hotel])


  const shareData = {
    id: finalData?.id,
    checkIn: finalData?.checkIn,
    checkOut: finalData?.checkIn,
    total: finalData?.total,
    room: finalData?.room,
    location: finalData?.location,
    startingPrice: finalData?.startingPrice,
  };

  const encoded = btoa(JSON.stringify(shareData));
  const shareUrl = `https://www.ino.com/hotel?data=${encoded}`;



  return (
    <>
      {loading ? (
        <ActivityIndicator size="large" color="#0077CC" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          {/* <View style={styles.heroContainer}>
            <Image
              source={{ uri: hotel?.imageUrls?.[0] }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.heroOverlay}
            />
            <View style={styles.heroContent}>
              <View style={styles.hotelInfo}>
                <Text style={styles.hotelName}>{hotel?.name}</Text>
                <Text style={styles.hotelAddress}>{hotel?.address}</Text>
              </View>
            </View>
          </View> */}
          <View style={styles.heroContainer}>
            <Image
              source={{ uri: hotel?.imageUrls?.[0] }}
              style={styles.heroImage}
              resizeMode="cover"
            />

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

            <View style={styles.heroContent}>
              <View style={styles.hotelInfo}>
                <Text style={styles.hotelName}>{hotel?.name}</Text>
                <Text style={styles.hotelAddress}>{hotel?.address}</Text>
              </View>
            </View>
            <HotelShareButton
              url={shareUrl}
              message={`Check out this hotel: ${hotel?.name}`}
            />
          </View>


          <View style={styles.contentContainer}>
            {/* Recommended Rooms Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Recommended Rooms allocated for {totalPeople} {totalPeople > 1 ? "people" : "person"}
              </Text>

              {allocatedRooms === null ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>
                    Sorry, no rooms available to accommodate {totalPeople} people.
                  </Text>
                </View>
              ) : (
                <View style={styles.roomsContainer}>
                  {allocatedRooms?.map((roomObj, i) => {
                    const room = roomObj.room;
                    const count = roomObj.count;
                    const totalPrice = room.pricePerNight * count;

                    return (
                      <View key={i} style={styles.roomCard}>
                        <View style={styles.roomInfo}>
                          <Text style={styles.roomName}>
                            {count} × {room.name}
                          </Text>
                          <Text style={styles.roomOccupancy}>
                            Max Occupancy: {room.maxOccupancy}
                          </Text>
                          <View style={styles.featuresContainer}>
                            {room.features?.map((feat, idx) => (
                              <View key={idx} style={styles.featureItem}>
                                <View style={styles.bullet} />
                                <Text style={styles.featureText}>{feat}</Text>
                              </View>
                            ))}
                          </View>
                        </View>

                        <View style={styles.roomPrice}>
                          <Text style={styles.priceLabel}>Price per night</Text>
                          <Text style={styles.priceAmount}>₹{room.pricePerNight}</Text>
                          <Text style={styles.totalPrice}>Total: ₹{totalPrice}/Night</Text>
                        </View>
                      </View>
                    );
                  })}

                  <View style={styles.totalSection}>
                    <View style={styles.totalAmountContainer}>
                      <Text style={styles.totalAmount}>
                        Total Amount: ₹{grandTotal * numberofDays}
                      </Text>
                      <Pressable onPress={() => setShowInfo(!showInfo)}>
                        <Icon name="info-outline" size={24} color="#3B82F6" />
                      </Pressable>
                    </View>

                    <Pressable style={styles.reserveButton} onPress={async () => await handleBook(allocatedRooms)}>
                      <Text style={styles.reserveButtonText}>Reserve Now</Text>
                    </Pressable>
                  </View>

                  {/* <View style={style3.container2}>
                    <Carousel
                      ref={carouselRef}
                      width={width * 0.9}
                      height={250}
                      autoPlay
                      autoPlayInterval={2500}
                      data={hotel.imageUrls}
                      scrollAnimationDuration={1000}
                      pagingEnabled
                      mode="parallax"
                      modeConfig={{
                        parallaxScrollingScale: 0.9,
                        parallaxScrollingOffset: 60,
                      }}
                      renderItem={({ item }) => (
                        <Image
                          source={{ uri: item }}
                          style={style3.image}
                          resizeMode="cover"
                        />
                      )}
                    />
                    <TouchableOpacity
                      onPress={() => carouselRef.current?.prev()}
                      style={[style3.arrowButton, { left: 10 }]}
                    >
                      <Svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="white"
                        viewBox="0 0 24 24"
                        width={28}
                        height={28}
                      >
                        <Path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                      </Svg>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => carouselRef.current?.next()}
                      style={[style3.arrowButton, { right: 10 }]}
                    >
                      <Svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="white"
                        viewBox="0 0 24 24"
                        width={28}
                        height={28}
                      >
                        <Path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                      </Svg>
                    </TouchableOpacity>
                  </View> */}
                  <HotelCarousel hotel={hotel} />



                  {/* Booking Policy Card */}
                  <View style={styles.policyCard}>
                    <Text style={styles.policyTitle}>Booking & Advance Fee Policy</Text>
                    <Text style={styles.policyText}>
                      To place a booking request, a small advance fee is required.
                      We'll review availability and confirm your request within 24 hours.
                    </Text>

                    <View style={styles.policyList}>
                      <View style={styles.policyItem}>
                        <View style={styles.policyBullet} />
                        <Text style={styles.policyItemText}>
                          If approved, you'll receive a payment link by email/SMS.
                        </Text>
                      </View>

                      <View style={styles.policyItem}>
                        <View style={styles.policyBullet} />
                        <Text style={styles.policyItemText}>
                          You'll have 48 hours to complete the full payment.
                        </Text>
                      </View>

                      <View style={styles.policyItem}>
                        <View style={styles.policyBullet} />
                        <Text style={styles.policyItemText}>
                          If payment isn't completed in time, your request will be automatically cancelled and the advance fee becomes non-refundable.
                        </Text>
                      </View>

                      <View style={styles.policyItem}>
                        <View style={styles.policyBullet} />
                        <Text style={styles.policyItemText}>
                          You can cancel within the 48-hour window and get a full refund of the advance fee.
                        </Text>
                      </View>
                    </View>

                    <View style={styles.tipContainer}>
                      <Text style={styles.tipText}>
                        <Text style={styles.tipLabel}>Tip:</Text> Keep an eye on your inbox/SMS for the payment link to secure your booking on time.
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* About Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About the Hotel</Text>

              <View style={styles.tagsContainer}>
                {hotel?.tags?.map((tag, i) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionText}>
                  {displayedText}
                  {isLong && !showFull && "..."}
                </Text>
                {isLong && (
                  <Pressable onPress={() => setShowFull(!showFull)}>
                    <Text style={styles.showMoreText}>
                      {showFull ? "Show less" : "Show more"}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>

            <RoomSelectionTable
              hotelRooms={hotelRooms}
              numberofDays={numberofDays}
              totalPeople={finalData.total}
              handleBookNow={(e) => handleBook(e)}
            />

            {/* Facilities Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Facilities that this hotel offers</Text>
              <View style={styles.facilitiesGrid}>
                {hotel?.amenities?.map((amenity, idx) => (
                  <View key={idx} style={styles.facilityItem}>
                    <View style={styles.facilityIcon}>
                      {/* <Icon name="star" size={20} color="#1E40AF" /> */}
                      {getAmenityIcon(amenity.name)}
                    </View>
                    <Text style={styles.facilityText} numberOfLines={1}>
                      {amenity.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Date and Guest Picker */}
            <View style={styles.searchContainer}>
              <View style={styles.searchRow}>
                <View style={styles.datePickerContainer}>
                  <Text style={styles.inputLabel}>Dates</Text>
                  <Pressable onPress={() => setShowPicker(true)} style={styles.dateInput}>
                    <Icon name="date-range" size={20} color="#3B82F6" />
                    <Text style={styles.dateInputText}>{range.startDate && range.endDate
                      ? `${range.startDate.toDateString()} - ${range.endDate.toDateString()}`
                      : "Select dates"}</Text>
                    {/* <Text style={styles.dateInputText}>Check-in - Check-out</Text> */}
                  </Pressable>
                </View>

                <View style={styles.guestPickerContainer}>
                  <Text style={styles.inputLabel}>Guests & Rooms</Text>
                  <Pressable
                    style={styles.guestInput}
                    onPress={() => setShowDropdown(true)}
                  >
                    <Icon name="people" size={20} color="#3B82F6" />
                    <Text style={styles.guestInputText}>
                      {`${adults} Adults • ${children} Children • ${rooms} Rooms`}
                    </Text>
                  </Pressable>
                </View>
              </View>

              <Pressable style={styles.searchButton} onPress={handleSearch}>
                <Text style={styles.searchButtonText}>Search</Text>
              </Pressable>
            </View>
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
                <Text style={[style3.sheetTitle,{color:"#000"}]}>Select rooms and guests</Text>

                {/* Rooms */}
                <View style={style3.row}>
                  <Text style={{color:'#000'}}>Rooms</Text>
                  <View style={style3.counter}>
                    <TouchableOpacity onPress={() => decrementRooms(setRooms)} style={style3.roundButton}>
                      <Text style={style3.btnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={[style3.count,{color:"#000"}]}>{rooms}</Text>
                    <TouchableOpacity onPress={() => incrementRooms(setRooms)} style={style3.roundButton}>
                      <Text style={style3.btnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Adults */}
                <View style={style3.row}>
                  <Text style={{color:'#000'}}>Adults</Text>
                  <View style={style3.counter}>
                    <TouchableOpacity onPress={() => decrement(setAdults)} style={style3.roundButton}>
                      <Text style={style3.btnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={[style3.count,{color:"#000"}]}>{adults}</Text>
                    <TouchableOpacity onPress={() => increment(setAdults)} style={style3.roundButton}>
                      <Text style={style3.btnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={style3.row}>
                  <Text style={{color:'#000'}}>Children</Text>
                  <View style={style3.counter}>
                    <TouchableOpacity onPress={() => decrement(setChildren)} style={style3.roundButton}>
                      <Text style={style3.btnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={[style3.count,{color:"#000"}]}>{children}</Text>
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
            <DatePickerModal
              locale="en"
              mode="range"
              visible={showPicker}
              onDismiss={() => setShowPicker(false)}
              startDate={range.startDate}
              endDate={range.endDate}
              onConfirm={onConfirm}
            />

            {/* Cancellation Policy */}
            <View style={styles.policySection}>
              <Text style={styles.sectionTitle}>Our Premium Guest-First Cancellation Policy</Text>

              <View style={styles.policyFeature}>
                <Icon name="cancel" size={26} color="#3B82F6" />
                <View style={styles.policyFeatureContent}>
                  <Text style={styles.policyFeatureTitle}>Flexible & Hassle-Free Cancellations</Text>
                  <Text style={styles.policyFeatureText}>
                    At {hotel?.name}, we provide a 100% refund for cancellations made 10 days or more before your scheduled arrival.
                    However, no refund will be provided for cancellations made within 10 days of the arrival date.
                  </Text>
                </View>
              </View>

              <View style={styles.policyFeature}>
                <Icon name="autorenew" size={26} color="#3B82F6" />
                <View style={styles.policyFeatureContent}>
                  <Text style={styles.policyFeatureTitle}>Easy & Transparent Refunds</Text>
                  <Text style={styles.policyFeatureText}>
                    Eligible refunds will be processed to your original payment method within 5–7 business days.
                  </Text>
                </View>
              </View>

              <View style={styles.policyFeature}>
                <Icon name="support-agent" size={26} color="#3B82F6" />
                <View style={styles.policyFeatureContent}>
                  <Text style={styles.policyFeatureTitle}>24/7 Dedicated Guest Support</Text>
                  <Text style={styles.policyFeatureText}>
                    Our guest support team is available around the clock to assist with any modifications or special requests.
                  </Text>
                </View>
              </View>
            </View>

            {/* Nearby Attractions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nearby Attractions</Text>
              {nearbyAttractions?.length === 0 ? (
                <Text style={styles.noAttractionsText}>No nearby attractions available.</Text>
              ) : (
                <View style={styles.attractionsContainer}>
                  {nearbyAttractions?.map((attraction, index) => (
                    <View key={index} style={styles.attractionItem}>
                      <Icon name="place" size={30} color="#3B82F6" />
                      <View style={styles.attractionInfo}>
                        <Text style={styles.attractionName}>{attraction.name}</Text>
                        <Text style={styles.attractionDistance}>{attraction.distance} away</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      )}
    </>
  )
}

export default HotelDetailsPage

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

  container2: {
    width: "100%",
    height: 250,
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: "#000",

  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    // margin: 8,
  },
  arrowButton: {
    position: "absolute",
    top: "45%",
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 20,
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
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  // Hero Section
  backButton: {
    position: "absolute",
    top: 40,   // adjust for status bar
    left: 20,
    padding: 5,
    borderRadius: 50,
  },
  heroContainer: {
    height: height * 0.4,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroContent: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
  hotelInfo: {
    flex: 1,
  },
  hotelName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  hotelAddress: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },

  // Content Container
  contentContainer: {
    paddingHorizontal: 16,
  },

  // Section
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },

  // Rooms Section
  roomsContainer: {
    gap: 10,
  },
  roomCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  roomInfo: {
    flex: 1,
    marginBottom: 16,
  },
  roomName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  roomOccupancy: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  featuresContainer: {
    gap: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6B7280',
  },
  featureText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  roomPrice: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceAmount: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2563EB',
    marginVertical: 4,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  // Error Container
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '500',
  },

  // Total Section
  totalSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  reserveButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  reserveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Policy Card
  policyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  policyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  policyText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 16,
  },
  policyList: {
    gap: 12,
    marginBottom: 16,
  },
  policyItem: {
    flexDirection: 'row',
    gap: 12,
  },
  policyBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6B7280',
    marginTop: 8,
  },
  policyItemText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    flex: 1,
  },
  tipContainer: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  tipLabel: {
    fontWeight: '600',
    color: '#374151',
  },

  // Tags
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    color: '#1E40AF',
    fontSize: 14,
    fontWeight: '500',
  },

  // Description
  descriptionContainer: {
    marginTop: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  showMoreText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },

  // Facilities
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    minWidth: (width - 48) / 2 - 4,
  },
  facilityIcon: {
    backgroundColor: '#DBEAFE',
    padding: 8,
    borderRadius: 8,
  },
  facilityText: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },

  // Search Container
  searchContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchRow: {
    gap: 12,
    marginBottom: 16,
  },
  datePickerContainer: {
    flex: 1,
  },
  guestPickerContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  dateInputText: {
    fontSize: 16,
    color: '#6B7280',
    flex: 1,
  },
  guestInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  guestInputText: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
  searchButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Policy Section
  policySection: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 12,
    marginVertical: 16,
  },
  policyFeature: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  policyFeatureContent: {
    flex: 1,
  },
  policyFeatureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  policyFeatureText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },

  // Attractions
  attractionsContainer: {
    gap: 12,
  },
  attractionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  attractionInfo: {
    flex: 1,
  },
  attractionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  attractionDistance: {
    fontSize: 14,
    color: '#6B7280',
  },
  noAttractionsText: {
    fontSize: 16,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});