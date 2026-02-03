import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  StyleSheet,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import PickerSelect from 'react-native-picker-select';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import React, { useRef, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
// import { useNavigation } from 'expo-router';
import { useNavigation } from "@react-navigation/native";
import { fetchUserBookings } from './../../Redux/profileSlice'
import { cancelBooking, getRefundStatus } from './../../Redux/hotelSlice'
import * as SecureStore from "expo-secure-store";
import PaymentDeadline from './PaymentDeadLine';
import { confirmPayment } from '@/components/Redux/paymentSlice';
import Toast from 'react-native-root-toast';
import RazorpayCheckout from 'react-native-razorpay';
import Constants from "expo-constants";
import PaymentSuccessfulModal from '@/components/ModalComponent/PaymentSuccessfulModal';
import PaymentFailedModal from '@/components/ModalComponent/PaymentFailedModal';

// const { width } = Dimensions.get('window');

const statusMap = {
  // ALL: "",
  Upcoming: "CONFIRMED",
  "Payment Pending": "PENDING,AWAITING_CUSTOMER_PAYMENT",
  Past: "COMPLETED",
  Canceled: "EXPIRED,REJECTED,CANCELLED",
  Processing: "AWAITING_ADMIN_CONFIRMATION",
};

// Custom dropdown options for each tab
const tabDropdownOptions = {
  Upcoming: ["CONFIRMED"],
  "Payment Pending": ["ALL", "PENDING", "PAYMENT PENDING"],
  // "Payment Pending": ["ALL","PENDING","AWAITING_CUSTOMER_PAYMENT"],
  Processing: ["PENDING ADMIN CONFIRMATION"],
  Past: ["COMPLETED"],
  Canceled: ["ALL", "EXPIRED", "REJECTED", "CANCELLED"],
};

const HotelBookings = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { razorpaykey } = Constants.expoConfig.extra;

  const [showDropdown, setShowDropdown] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [expandedCards, setExpandedCards] = useState({});
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("Upcoming");
  const [selectedDropdownOption, setSelectedDropdownOption] = useState("All Upcoming");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCustomReason, setShowCustomReason] = useState(false);

  //payment
  const [paidAt, setPaidAt] = useState("")
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [bookingId, setBookingId] = useState("")
  const [total, setTotal] = useState("")
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")

  // Refund modal state
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundBookingId, setRefundBookingId] = useState(null);

  // Not eligible for refund modal state
  const [showNotEligibleModal, setShowNotEligibleModal] = useState(false);
  const [notEligibleMessage, setNotEligibleMessage] = useState("");

  //Button scheduler
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Update every 1 minute (or 1 second if you need more accuracy)
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000 * 60);

    return () => clearInterval(interval);
  }, []);

  // Not eligible for refund confirm modal state
  const [showNotEligibleConfirmModal, setShowNotEligibleConfirmModal] = useState(false);
  const [pendingCancelBookingId, setPendingCancelBookingId] = useState(null);

  // Get refund status from Redux
  const { refundStatus, refundLoading, refundError } = useSelector((state) => state.hotel);

  // Predefined cancellation reasons
  const cancellationReasons = [
    "Change of plans",
    "Found better accommodation",
    "Travel dates changed",
    "Emergency situation",
    "Price too high",
    "Location not suitable",
    "Others"
  ];

  const toggleExpand = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const fetchBookings = async (pageNum, selectedStatus = status) => {
    setLoading(true);
    setError(null);
    try {
      const token = await SecureStore.getItemAsync("token");
      const res = await dispatch(fetchUserBookings({ token, page: pageNum, size, status: selectedStatus }));

      if (res.payload && res.payload.status === 200) {
        const data = res.payload.data;
        console.log(data.content)
        setBookings(data.content);
        setTotalPages(data.totalPages);
        setPage(data.pageNumber);
      } else {
        // Handle API errors (404, 401, etc.)
        setError("Failed to fetch bookings. Please try again later.");
        setBookings([]);
        setTotalPages(1);
        setPage(0);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Something went wrong. Please try again later.");
      setBookings([]);
      setTotalPages(1);
      setPage(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(0, "CONFIRMED");
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchBookings(newPage);
    }
  };
  const handleDropdownChange = (dropdownOption) => {
    setSelectedDropdownOption(dropdownOption);
    if (status === "Payment Pending" && dropdownOption === "ALL") {
      fetchBookings(0, "PENDING,AWAITING_CUSTOMER_PAYMENT");

    } else if (status === "Canceled" && dropdownOption === "ALL") {
      fetchBookings(0, "EXPIRED,REJECTED,CANCELLED");
    } else if (dropdownOption !== "PAYMENT PENDING" && dropdownOption !== "PENDING ADMIN CONFIRMATION") {

      fetchBookings(0, dropdownOption);
    } else if (dropdownOption === "PAYMENT PENDING") {
      fetchBookings(0, "AWAITING_CUSTOMER_PAYMENT");
    } else if (dropdownOption === "PENDING ADMIN CONFIRMATION") {
      fetchBookings(0, "AWAITING_ADMIN_CONFIRMATION");
    }
  };

  const handleStatusChange = (option) => {
    console.log(option)
    setStatus(option);
    setSelectedDropdownOption(tabDropdownOptions[option][0]);
    if (option === "Payment Pending") {
      // fetchBookings(0, statusMap[option]);
      fetchBookings(0, "PENDING,AWAITING_CUSTOMER_PAYMENT");
    } else if (option === "Canceled") {
      fetchBookings(0, "EXPIRED,REJECTED,CANCELLED");
    } else {
      console.log(statusMap[option])
      fetchBookings(0, statusMap[option]);
    }
  };



  // Cancel booking handler
  const handleCancelBooking = async () => {
    setCancelLoading(true);
    const token = await SecureStore.getItemAsync("token");
    await dispatch(
      cancelBooking({ token, bookingGroupCode: cancelBookingId, cancelReason })
    );
    setCancelLoading(false);
    setShowCancelModal(false);
    setCancelBookingId(null);
    setCancelReason("");
    setShowCustomReason(false);
    // Refetch bookings
    fetchBookings(page, "CONFIRMED");
  };

  // Handle reason selection
  const handleReasonSelect = (reason) => {
    if (reason === "Others") {
      setShowCustomReason(true);
      setCancelReason("Others");
    } else {
      setShowCustomReason(false);
      setCancelReason(reason);
    }
  };

  // Handle refund status
  const handleRefundStatus = async (bookingGroupCode) => {
    try {
      const token = await SecureStore.getItemAsync("token");
      const result = await dispatch(getRefundStatus({ token, bookingGroupCode }));

      if (result.error) {
        setNotEligibleMessage("Unfortunately, this booking is not eligible for a refund. If you believe this is a mistake or have questions, please contact our support team for assistance.");
        setShowNotEligibleModal(true);
        return;
      }
      console.log(refundStatus)
      setRefundBookingId(bookingGroupCode);
      setShowRefundModal(true);
    } catch (error) {
      setNotEligibleMessage("Unfortunately, this booking is not eligible for a refund. If you believe this is a mistake or have questions, please contact our support team for assistance.");
      setShowNotEligibleModal(true);
    }
  };

  const topRef = useRef(null);

  useEffect(() => {
    if (topRef.current) {
      const navbarHeight = 80; // px height of your navbar
      const elementTop = topRef.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementTop - navbarHeight,
        behavior: "smooth",
      });
    }
  }, []);

  const handlePaymentConfirm = async (paymentId, razorpayOrderId, razorpaySignature) => {
    const token = await SecureStore.getItemAsync("token");

    const res = await dispatch(
      confirmPayment({
        token,
        razorpayPaymentId: paymentId,
        razorpayOrderId: razorpayOrderId,
        razorpaySignature: razorpaySignature,
      })
    );
    // console.log(res)
    if (res.payload.status == 200 || res.payload.status == 409) {
      // console.log(res.payload.data)
      setPaidAt(res.payload.data?.paidAt)
      setShowSuccess(true)
      // setBookingModal(true)
      // console.log("SUCCESSFULL")
      let toast = Toast.show("Payment Successful", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
      });
      setTimeout(() => Toast.hide(toast), 2000);
      // navigation.navigate("hotelsSearch");
    } else {
      // console.log("NOT SUCCESSFULL")
      // setFailModal(true)
      setShowFailure(true)
    }
  };

  const openRazorpay = async (orderId) => {
    try {
      // Fetch user data (replace this part with however you're storing it)
      const userDataString = await SecureStore.getItemAsync("userData");
      const decoded = userDataString ? JSON.parse(userDataString) : {};

      const options = {
        description: 'Hotel Booking Payment',
        currency: 'INR',
        key: razorpaykey, // or use import.meta.env.VITE_RAZORPAY_KEY if configured for RN
        // amount: totalAmount * 100, // Razorpay expects amount in paise
        name: 'INO TRAVELS',
        order_id: orderId, // this should come from your backend (Razorpay order API)
        prefill: {
          name: decoded.name || 'Guest',
          email: decoded.email || 'guest@example.com',
          contact: decoded.phoneNumber && decoded.phoneNumber !== "NA"
            ? decoded.phoneNumber
            : '',
        },
        theme: { color: '#3399cc' },
      };

      RazorpayCheckout.open(options)
        .then(async (response) => {
          // success callback
          console.log("Payment Success:", response);
          await handlePaymentConfirm(
            response.razorpay_payment_id,
            response.razorpay_order_id,
            response.razorpay_signature
          );
        })
        .catch((error) => {
          console.log("Payment Cancelled/Error:", error);
          Toast.show("Booking not confirmed. Payment was cancelled.", {
            duration: Toast.durations.SHORT,
            position: Toast.positions.BOTTOM,
          });
        });
    } catch (error) {
      console.log("Error opening Razorpay:", error);
    }
  };
  return (
    <ScrollView style={list.container} contentContainerStyle={list.contentContainer}>
      <View style={list.innerContainer}>
        {/* Filter Tabs */}
        <View style={list.filterSection}>
          <View style={list.filterWrapper}>
            {/* Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={list.tabsContainer}
            >
              {Object.keys(statusMap).map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => handleStatusChange(option)}
                  style={[
                    list.tabButton,
                    status === option ? list.tabButtonActive : list.tabButtonInactive,
                  ]}
                >
                  <Text
                    style={[
                      list.tabButtonText,
                      status === option ? list.tabButtonTextActive : list.tabButtonTextInactive,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Dropdown */}
            {status !== 'ALL' &&
              status !== 'Upcoming' &&
              status !== 'Past' &&
              status !== 'Processing' && (
                <View style={{ marginTop: 8 }}>

                  {/* Dropdown Button */}
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowDropdown(!showDropdown)}
                  >
                    <Text style={styles.dropdownButtonText}>
                      {selectedDropdownOption}
                    </Text>
                    <MaterialIcons
                      name={showDropdown ? "arrow-drop-up" : "arrow-drop-down"}
                      size={24}
                      color="#6b7280"
                    />
                  </TouchableOpacity>

                  {/* Dropdown List */}
                  {showDropdown && (
                    <View style={styles.dropdownList}>
                      {tabDropdownOptions[status].map((item) => (
                        <TouchableOpacity
                          key={item}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setShowDropdown(false);
                            handleDropdownChange(item);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{item}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}

          </View>
        </View>

        {/* Loading State */}
        {loading ? (
          <View style={list.loadingContainer}>
            {[1, 2, 3].map((index) => (
              <View key={index} style={list.skeletonCard}>
                <View style={list.skeletonContent}>
                  <View style={list.skeletonLeft}>
                    <View style={[list.skeletonLine, { width: 160, height: 20 }]} />
                    <View style={[list.skeletonLine, { width: 240, height: 16, marginTop: 12 }]} />
                    <View style={[list.skeletonLine, { width: 192, height: 16, marginTop: 8 }]} />
                  </View>
                  <View style={list.skeletonRight}>
                    <View style={[list.skeletonLine, { width: 96, height: 16 }]} />
                    <View style={[list.skeletonLine, { width: 80, height: 16, marginTop: 8 }]} />
                  </View>
                </View>
                <View style={list.skeletonButton}>
                  <View style={[list.skeletonLine, { width: 96, height: 32 }]} />
                </View>
              </View>
            ))}
          </View>
        ) : error ? (
          /* Error State */
          <View style={list.emptyState}>
            <View style={list.emptyIconContainer}>
              <MaterialIcons name="description" size={48} color="#9ca3af" />
            </View>
            <Text style={list.emptyTitle}>No Data Available</Text>
          </View>
        ) : bookings.length > 0 ? (
          /* Bookings List */
          <FlatList
            data={bookings}
            keyExtractor={(item) => item.bookingGroupCode}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={list.bookingCard}
                onPress={() => toggleExpand(item.bookingGroupCode)}
                activeOpacity={0.7}
              >
                {/* Booking Header */}
                <View style={list.bookingHeader}>
                  <View style={list.bookingHeaderLeft}>
                    <Text style={list.bookingId}>
                      Booking ID: <Text style={list.bookingIdBold}>{item.bookingGroupCode}</Text>
                    </Text>
                    <Text style={list.bookingTitle}>
                      {item.numberOfGuests} Guest{item.numberOfGuests > 1 ? 's' : ''} |{' '}
                      {item.roomBookingsList.length} Room Type
                      {item.roomBookingsList.length > 1 ? 's' : ''}
                    </Text>

                    {/* Hotel Name and Status */}
                    <View style={list.hotelNameRow}>
                      <Text style={list.hotelName}>{item.hotelName}</Text>
                      <View
                        style={[
                          list.statusBadge,
                          item.status === 'CONFIRMED' && list.statusConfirmed,
                          item.status === 'CANCELLED' && list.statusCancelled,
                          item.status === 'PARTIALLY_CANCELLED' && list.statusPartial,
                          item.status === 'COMPLETED' && list.statusCompleted,
                        ]}
                      >
                        <Text style={list.statusText}>
                          {item.status.replace(/_/g, ' ')}
                        </Text>
                      </View>
                    </View>

                    {/* Room Details */}
                    <View style={list.roomList}>
                      {item.roomBookingsList.map((room, idx) => (
                        <View key={idx} style={list.roomItem}>
                          <Text style={list.roomText}>
                            <Text style={list.roomTextBold}>{room.roomName}</Text> (
                            {room.numberOfRooms} room{room.numberOfRooms > 1 ? 's' : ''}) — ₹
                            {room.totalPrice}
                          </Text>
                          {item.status === 'PARTIALLY_CANCELLED' && (
                            <View
                              style={[
                                list.statusBadge,
                                list.statusBadgeSmall,
                                room.status === 'CONFIRMED' && list.statusConfirmed,
                                room.status === 'CANCELLED' && list.statusCancelled,
                              ]}
                            >
                              <Text style={[list.statusText, list.statusTextSmall]}>
                                {room.status.replace(/_/g, ' ')}
                              </Text>
                            </View>
                          )}
                        </View>
                      ))}
                    </View>

                    {/* Hotel Details */}
                    <View style={list.hotelDetails}>
                      <Text style={list.hotelDetailsText}>{item.hotelAddress}</Text>
                      <Text style={list.hotelDetailsText}>{item.hotelContact}</Text>
                    </View>
                  </View>

                  {(item.status === "PENDING" || item.status === "PAYMENT PENDING" || item.status === "AWAITING_CUSTOMER_PAYMENT") && (
                    <PaymentDeadline expiredAt={item.expiredAt} />
                  )}
                  {/* Right Side Info */}
                  <View style={list.bookingHeaderRight}>
                    <Text style={list.infoText}>Check-in: {item.checkIn}</Text>
                    <Text style={list.infoText}>Check-out: {item.checkOut}</Text>
                    <Text style={list.infoText}>Total Guests: {item.numberOfGuests}</Text>
                    <Text style={list.totalPrice}>Total Price: ₹{item.totalPrice}</Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={list.actionButtonsContainer}>
                  {item.status === 'CONFIRMED' && (
                    <TouchableOpacity
                      style={[list.actionButton, list.actionButtonDanger]}
                      onPress={() => {
                        const today = new Date();
                        const checkInDate = new Date(item.checkIn);
                        const diffTime = checkInDate - today;
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        if (diffDays <= 10) {
                          setPendingCancelBookingId(item.bookingGroupCode);
                          setShowNotEligibleConfirmModal(true);
                        } else {
                          setShowCancelModal(true);
                          setCancelBookingId(item.bookingGroupCode);
                          setCancelReason('');
                          setShowCustomReason(false);
                        }
                      }}
                    >
                      <Text style={list.actionButtonText}>Cancel Booking</Text>
                    </TouchableOpacity>
                  )}

                  {(item.status === 'CANCELLED' || item.status === 'REJECTED') && (
                    <TouchableOpacity
                      style={[list.actionButton, list.actionButtonPrimary]}
                      onPress={() => handleRefundStatus(item.bookingGroupCode)}
                    >
                      <Text style={list.actionButtonText}>See Refund Status</Text>
                    </TouchableOpacity>
                  )}

                  {item.status === 'PENDING' && now < new Date(item.expiredAt || Date.now()) && (
                    <TouchableOpacity
                      style={[list.actionButton, list.actionButtonSuccess]}
                      onPress={async () => {
                        const payment = item.payments;
                        const pay = payment.filter(item => item.paymentType === "FINAL");
                        const razorId = pay[0]?.razorpayOrderId;
                        setTotal(item.numberOfGuests)
                        setCheckIn(item.checkIn)
                        setCheckOut(item.checkOut)
                        setBookingId(item.bookingGroupCode)
                        await openRazorpay(razorId)
                      }}
                    >
                      <Text style={list.actionButtonText}>Pay Now</Text>
                    </TouchableOpacity>
                  )}

                  {item.status === 'AWAITING_CUSTOMER_PAYMENT' &&
                    now < new Date(item.expiredAt || Date.now()) && (
                      <>
                        <TouchableOpacity
                          style={[list.actionButton, list.actionButtonDanger]}
                          onPress={() => {
                            setShowCancelModal(true);
                            setCancelBookingId(item.bookingGroupCode);
                            setCancelReason('');
                            setShowCustomReason(false);
                          }}
                        >
                          <Text style={list.actionButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[list.actionButton, list.actionButtonSuccess]}
                          onPress={async () => {
                            const payment = item.payments;
                            const pay = payment.filter(item => item.paymentType === "FINAL");
                            const razorId = pay[0]?.razorpayOrderId;
                            console.log('Pay Now clicked');
                            setTotal(item.numberOfGuests)
                            setCheckIn(item.checkIn)
                            setCheckOut(item.checkOut)
                            setBookingId(item.bookingGroupCode)
                            await openRazorpay(razorId)
                          }}
                        >
                          <Text style={list.actionButtonText}>Pay Now</Text>
                        </TouchableOpacity>
                      </>
                    )}
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          /* Empty State */
          <View style={list.emptyState}>
            <View style={list.emptyIconContainer}>
              <MaterialIcons name="description" size={48} color="#9ca3af" />
            </View>
            <Text style={list.emptyTitle}>No Bookings Found</Text>
            <Text style={list.emptyDescription}>
              {status === 'ALL'
                ? "You haven't made any bookings yet. Start exploring hotels and make your first reservation!"
                : `No ${selectedDropdownOption.toLowerCase()} ${status.toLowerCase()} bookings found.`}
            </Text>
            <TouchableOpacity style={list.exploreButton} onPress={() => console.log('Navigate to home')}>
              <Text style={list.exploreButtonText}>Explore Hotels</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Cancel Modal */}
        <Modal
          visible={showCancelModal}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setShowCancelModal(false);
            setShowCustomReason(false);
          }}
        >
          <View style={list.modalOverlay}>
            <Animated.View entering={FadeIn} exiting={FadeOut} style={list.modalContainer}>
              <Text style={list.modalTitle}>Cancel Booking</Text>
              <Text style={list.modalLabel}>Reason for cancellation:</Text>

              <ScrollView style={list.modalContent}>
                {cancellationReasons.map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    style={list.radioOption}
                    onPress={() => handleReasonSelect(reason)}
                  >
                    <View
                      style={[
                        list.radioCircle,
                        cancelReason === reason && list.radioCircleSelected,
                      ]}
                    >
                      {cancelReason === reason && <View style={list.radioInner} />}
                    </View>
                    <Text style={list.radioText}>{reason}</Text>
                  </TouchableOpacity>
                ))}

                {showCustomReason && (
                  <View style={list.customReasonContainer}>
                    <TextInput
                      style={list.textArea}
                      multiline
                      numberOfLines={3}
                      value={cancelReason}
                      onChangeText={(text) => setCancelReason(text)}
                      placeholder="Enter your custom reason..."
                      autoFocus
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                )}
              </ScrollView>

              <View style={list.modalButtons}>
                <TouchableOpacity
                  style={[list.modalButton, list.modalButtonSecondary]}
                  onPress={() => {
                    setShowCancelModal(false);
                    setShowCustomReason(false);
                  }}
                >
                  <Text style={list.modalButtonTextSecondary}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    list.modalButton,
                    list.modalButtonPrimary,
                    (!cancelReason.trim() || cancelLoading) && list.modalButtonDisabled,
                  ]}
                  disabled={cancelLoading || !cancelReason.trim()}
                  onPress={handleCancelBooking}
                >
                  <Text style={list.modalButtonText}>
                    {cancelLoading ? 'Cancelling...' : 'Submit'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>

        {/* Refund Status Modal */}
        <Modal
          visible={showRefundModal && refundStatus !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setShowRefundModal(false)}
        >
          <View style={list.modalOverlay}>
            <ScrollView contentContainerStyle={list.modalScrollContent}>
              <Animated.View entering={FadeIn} exiting={FadeOut} style={list.modalContainerLarge}>
                <Text style={list.modalTitle}>Refund Status</Text>

                {/* Progress Bar */}
                <View style={list.progressSection}>
                  <View style={list.progressLabels}>
                    <View style={list.progressLabelLeft}>
                      <Ionicons name="time" size={20} color="#3b82f6" />
                      <Text style={list.progressText}>INITIATED</Text>
                    </View>
                    <View style={list.progressLabelRight}>
                      <Text style={list.progressText}>COMPLETED</Text>
                      <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    </View>
                  </View>

                  <View style={list.progressBar}>
                    <View
                      style={[
                        list.progressFill,
                        list.progressFillPrimary,
                        {
                          width: refundStatus?.refundStatus === 'COMPLETED' ? '100%' : '50%',
                        },
                      ]}
                    />
                  </View>

                  <View style={list.statusBadgeCenter}>
                    <View
                      style={[
                        list.statusBadgeLarge,
                        refundStatus?.refundStatus === 'COMPLETED' && list.statusCompleted,
                      ]}
                    >
                      <Text style={list.statusText}>{refundStatus?.refundStatus}</Text>
                    </View>
                  </View>
                </View>

                {/* Refund Details */}
                <View style={list.refundDetails}>
                  <View style={list.detailRow}>
                    <Text style={list.detailLabel}>Cancel Reason:</Text>
                    <Text style={list.detailValue}>{refundStatus?.cancelReason}</Text>
                  </View>
                  <View style={list.detailRow}>
                    <Text style={list.detailLabel}>Refunded Amount:</Text>
                    <Text style={list.detailValueBold}>₹{refundStatus?.refundAmount}</Text>
                  </View>
                </View>

                <View style={list.infoBox}>
                  <Text style={list.infoText}>
                    Your refund will be processed within 5–7 business days.
                  </Text>
                </View>

                <TouchableOpacity
                  style={[list.modalButton, list.modalButtonPrimary, { alignSelf: 'flex-end' }]}
                  onPress={() => setShowRefundModal(false)}
                >
                  <Text style={list.modalButtonText}>Close</Text>
                </TouchableOpacity>
              </Animated.View>
            </ScrollView>
          </View>
        </Modal>

        {/* Not Eligible Modal */}
        <Modal
          visible={showNotEligibleModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowNotEligibleModal(false)}
        >
          <View style={list.modalOverlay}>
            <Animated.View entering={FadeIn} exiting={FadeOut} style={list.modalContainer}>
              <View style={list.modalIconCenter}>
                <Ionicons name="warning" size={64} color="#ef4444" />
              </View>
              <Text style={list.modalTitle}>Not Eligible for Refund</Text>
              <Text style={list.modalDescription}>{notEligibleMessage}</Text>
              <TouchableOpacity
                style={[list.modalButton, list.modalButtonPrimary, { alignSelf: 'center', marginTop: 8 }]}
                onPress={() => setShowNotEligibleModal(false)}
              >
                <Text style={list.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>

        {/* Not Eligible Confirm Modal */}
        <Modal
          visible={showNotEligibleConfirmModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowNotEligibleConfirmModal(false)}
        >
          <View style={list.modalOverlay}>
            <Animated.View entering={FadeIn} exiting={FadeOut} style={list.modalContainer}>
              <View style={list.modalIconCenter}>
                <Ionicons name="warning" size={64} color="#f59e0b" />
              </View>
              <Text style={list.modalTitle}>Not Eligible for Refund</Text>
              <Text style={list.modalDescription}>
                Cancellations within 10 days of check-in are not eligible for a refund. Do you
                want to continue and cancel your booking anyway?
              </Text>
              <View style={list.modalButtons}>
                <TouchableOpacity
                  style={[list.modalButton, list.modalButtonSecondary]}
                  onPress={() => setShowNotEligibleConfirmModal(false)}
                >
                  <Text style={list.modalButtonTextSecondary}>No, Go Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[list.modalButton, list.modalButtonPrimary]}
                  onPress={() => {
                    setShowNotEligibleConfirmModal(false);
                    setShowCancelModal(true);
                    setCancelBookingId(pendingCancelBookingId);
                    setCancelReason('');
                    setShowCustomReason(false);
                  }}
                >
                  <Text style={list.modalButtonText}>Yes, Cancel Anyway</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>

        {/* Pagination */}
        {!loading && !error && bookings.length > 0 && (
          <View style={list.paginationContainer}>
            <TouchableOpacity
              disabled={page === 0}
              onPress={() => handlePageChange(page - 1)}
              style={[list.paginationButton, page === 0 && list.paginationButtonDisabled]}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={page === 0 ? '#9ca3af' : '#ffffff'}
              />
              <Text
                style={[
                  list.paginationButtonText,
                  page === 0 && list.paginationButtonTextDisabled,
                ]}
              >
                Prev
              </Text>
            </TouchableOpacity>

            {Array.from({ length: totalPages }, (_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => handlePageChange(i)}
                style={[
                  list.paginationButton,
                  page === i ? list.paginationButtonActive : list.paginationButtonInactive,
                ]}
              >
                <Text
                  style={[
                    list.paginationButtonText,
                    page === i && list.paginationButtonTextActive,
                  ]}
                >
                  {i + 1}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              disabled={page === totalPages - 1}
              onPress={() => handlePageChange(page + 1)}
              style={[
                list.paginationButton,
                page === totalPages - 1 && list.paginationButtonDisabled,
              ]}
            >
              <Text
                style={[
                  list.paginationButtonText,
                  page === totalPages - 1 && list.paginationButtonTextDisabled,
                ]}
              >
                Next
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={page === totalPages - 1 ? '#9ca3af' : '#ffffff'}
              />
            </TouchableOpacity>
          </View>
        )}
        <PaymentSuccessfulModal
          visible={showSuccess}
          bookingId={bookingId}
          checkIn={checkIn}
          checkOut={checkOut}
          total={total}
          paidAt={paidAt}
          onClose={() => {
            setShowSuccess(false)
            // navigation.navigate("hotelsSearch");
            setStatus("Upcoming")
            fetchBookings(0, "CONFIRMED");
          }}
        />
        <PaymentFailedModal
          visible={showFailure}
          onClose={() => {
            setShowFailure(false)
            navigation.navigate("hotelsSearch");
          }}
        />

      </View>

    </ScrollView>
  )
}

export default HotelBookings

const styles = StyleSheet.create({
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },

  dropdownButtonText: {
    fontSize: 14,
    color: "#374151",
  },

  dropdownList: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    marginTop: 4,
    overflow: "hidden",
  },

  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  dropdownItemText: {
    fontSize: 14,
    color: "#374151",
  },

})
export const list = StyleSheet.create({
  // Container
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 40,
    paddingBottom: 80,
  },
  innerContainer: {
    width: '100%',
    paddingHorizontal: 16,
  },

  // Filter Section
  filterSection: {
    width: '100%',
    marginBottom: 24,
  },
  filterWrapper: {
    gap: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#2563eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButtonInactive: {
    backgroundColor: '#f3f4f6',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: '#ffffff',
  },
  tabButtonTextInactive: {
    color: '#374151',
  },

  // Dropdown
  dropdownContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  pickerSelectIOS: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#374151',
  },
  pickerSelectAndroid: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#374151',
  },
  pickerIconContainer: {
    top: 12,
    right: 8,
  },

  // Loading State
  loadingContainer: {
    gap: 16,
  },
  skeletonCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  skeletonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skeletonLeft: {
    flex: 1,
    paddingRight: 16,
  },
  skeletonRight: {
    alignItems: 'flex-end',
    paddingLeft: 16,
  },
  skeletonLine: {
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  skeletonButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },

  // Booking Card
  bookingCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bookingHeader: {
    flexDirection: 'column',
    gap: 16,
  },
  bookingHeaderLeft: {
    flex: 1,
  },
  bookingHeaderRight: {
    alignItems: 'flex-start',
    gap: 4,
  },
  bookingId: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  bookingIdBold: {
    fontWeight: '500',
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  hotelNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  hotelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },

  // Status Badge
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusBadgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusBadgeCenter: {
    alignItems: 'center',
    marginTop: 16,
  },
  statusBadgeLarge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusConfirmed: {
    backgroundColor: '#d1fae5',
  },
  statusCancelled: {
    backgroundColor: '#fee2e2',
  },
  statusPartial: {
    backgroundColor: '#fef3c7',
  },
  statusCompleted: {
    backgroundColor: '#dbeafe',
  },
  statusPending: {
    backgroundColor: '#e0e7ff',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#065f46',
  },
  statusTextSmall: {
    fontSize: 10,
  },

  // Room List
  roomList: {
    gap: 8,
    marginBottom: 12,
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  roomText: {
    fontSize: 14,
    color: '#374151',
  },
  roomTextBold: {
    fontWeight: '500',
  },

  // Hotel Details
  hotelDetails: {
    gap: 4,
  },
  hotelDetailsText: {
    fontSize: 14,
    color: '#6b7280',
  },

  // Info Text
  infoText: {
    fontSize: 12,
    color: '#6b7280',
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },

  // Action Buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: '#3b82f6',
  },
  actionButtonSuccess: {
    backgroundColor: '#10b981',
  },
  actionButtonDanger: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 16,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    backgroundColor: '#f3f4f6',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  exploreButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalContainerLarge: {
    backgroundColor: '#ffffff',
    padding: 32,
    borderRadius: 16,
    width: '100%',
    maxWidth: 600,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalIconCenter: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalContent: {
    maxHeight: 300,
    marginBottom: 16,
  },

  // Radio Options
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    marginBottom: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#3b82f6',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3b82f6',
  },
  radioText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },

  // Custom Reason
  customReasonContainer: {
    marginTop: 16,
    paddingLeft: 28,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1f2937',
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Modal Buttons
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  modalButtonPrimary: {
    backgroundColor: '#2563eb',
  },
  modalButtonSecondary: {
    backgroundColor: '#e5e7eb',
  },
  modalButtonDisabled: {
    backgroundColor: '#d1d5db',
    opacity: 0.6,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalButtonTextSecondary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },

  // Progress Section
  progressSection: {
    marginBottom: 24,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressLabelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressLabelRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressFillPrimary: {
    backgroundColor: '#3b82f6',
  },
  progressFillDanger: {
    backgroundColor: '#ef4444',
  },

  // Refund Details
  refundDetails: {
    gap: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
  },
  detailValueBold: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  detailValueDanger: {
    fontSize: 14,
    fontWeight: '500',
    color: '#dc2626',
  },

  // Info/Warning Boxes
  infoBox: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
  },
  warningBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 12,
  },
  warningText: {
    fontSize: 14,
    color: '#991b1b',
  },

  // Pagination
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    flexWrap: 'wrap',
  },
  paginationButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  paginationButtonActive: {
    backgroundColor: '#2563eb',
  },
  paginationButtonInactive: {
    backgroundColor: '#f3f4f6',
  },
  paginationButtonDisabled: {
    backgroundColor: '#e5e7eb',
    opacity: 0.5,
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  paginationButtonTextActive: {
    color: '#ffffff',
  },
  paginationButtonTextDisabled: {
    color: '#9ca3af',
  },
});