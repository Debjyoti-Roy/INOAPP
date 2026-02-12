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
import React, { useEffect, useState } from 'react'
import * as SecureStore from "expo-secure-store";
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserCarPackageBookings } from './../../Redux/profileSlice'
import { cancelcarPackageBooking, getRefundStatus } from './../../Redux/carPackageSlice'
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-root-toast';
import RazorpayCheckout from 'react-native-razorpay';
import Constants from "expo-constants";
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import PaymentFailedModal from '@/components/ModalComponent/PaymentFailedModal';
import CarPackageSuccessModal from '@/components/ModalComponent/CarPackageSuccessModal';
import { carPackageConfirmPayment } from '@/components/Redux/paymentSlice';
import Icon from 'react-native-vector-icons/FontAwesome5';
// import { confirmPayment } from '@/components/Redux/paymentSlice';

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

const MyCarPackageBookings = () => {
    const dispatch = useDispatch();
    const { razorpaykey } = Constants.expoConfig.extra;

    const [bookings, setBookings] = useState([]);
    const [expandedCards, setExpandedCards] = useState({});
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState("Upcoming");
    const [selectedDropdownOption, setSelectedDropdownOption] = useState("All Upcoming");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);

    // Cancel modal state
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelBookingId, setCancelBookingId] = useState(null);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [showCustomReason, setShowCustomReason] = useState(false);

    // Refund modal state
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [refundBookingId, setRefundBookingId] = useState(null);

    // Not eligible for refund modal state
    const [showNotEligibleModal, setShowNotEligibleModal] = useState(false);
    const [notEligibleMessage, setNotEligibleMessage] = useState("");

    //payment
    const [paidAt, setPaidAt] = useState("")
    const [showSuccess, setShowSuccess] = useState(false);
    const [showFailure, setShowFailure] = useState(false);
    const [bookingId, setBookingId] = useState("")
    const [total, setTotal] = useState('')
    const [travelDate, setTravelDate] = useState('')
    const [amount, setAmount] = useState()
    const [noOfDays, setNoOfDays] = useState()

    //Button scheduler
    const [now, setNow] = useState(new Date());

    const [expandedId, setExpandedId] = useState(null);

    const toggleExpand2 = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

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
    const [refundStatusData, setRefundStatusData] = useState({})
    const {
        carPackagebookings,
        carPackagebookingsLoading,
        carPackagebookingsError,
        carPackagebookingsStatus
    } = useSelector((state) => state.profile);
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
        console.log(selectedStatus)
        setLoading(true);
        setError(null);
        try {
            // const token = localStorage.getItem("token");
            const token = await SecureStore.getItemAsync("token");
            dispatch(fetchUserCarPackageBookings({ token, page: pageNum, size, status: selectedStatus }))
            if (carPackagebookingsStatus !== 200) {
                setError("Failed to fetch bookings. Please try again later.");
                setTotalPages(1);
                setPage(0);
            }
        } catch (err) {
            setError("Failed to fetch bookings. Please try again later.");
            setTotalPages(1);
            setPage(0);
        }
    }
    // const job = async()=
    useEffect(() => {
        if (status === "Payment Pending") {
            // fetchBookings(0, statusMap[option]);

            fetchBookings(0, "PENDING,AWAITING_CUSTOMER_PAYMENT");
        } else if (status === "Canceled") {

            fetchBookings(0, "EXPIRED,REJECTED,CANCELLED");
        } else {
            fetchBookings(0, statusMap[status]);
        }
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
            fetchBookings(0, "PENDING,AWAITING_CUSTOMER_PAYMENT");
        } else if (option === "Canceled") {
            fetchBookings(0, "EXPIRED,REJECTED,CANCELLED");
        } else {
            fetchBookings(0, statusMap[option]);
        }
    };
    const handleCancelBooking = async () => {
        setCancelLoading(true);
        const token = await SecureStore.getItemAsync("token");
        await dispatch(
            cancelcarPackageBooking({ token, bookingGroupCode: cancelBookingId, cancelReason })
        );
        setCancelLoading(false);
        setShowCancelModal(false);
        setCancelBookingId(null);
        setCancelReason("");
        setShowCustomReason(false);
        // Refetch bookings
        console.log("Hello")
        fetchBookings(page, "CONFIRMED");
    };
    const handleReasonSelect = (reason) => {
        if (reason === "Others") {
            setShowCustomReason(true);
            setCancelReason("Others");
        } else {
            setShowCustomReason(false);
            setCancelReason(reason);
        }
    };
    const handleRefundStatus = async (bookingGroupCode) => {
        try {
            // console.log("HELLO")
            const token = localStorage.getItem('token');
            const result = await dispatch(getRefundStatus({ token, bookingGroupCode }));
            console.log(result)
            if (result.error) {
                setNotEligibleMessage("Unfortunately, this booking is not eligible for a refund. If you believe this is a mistake or have questions, please contact our support team for assistance.");
                setShowNotEligibleModal(true);
                return;
            }
            //   console.log(refundStatus)
            setRefundStatusData(result.payload)
            setRefundBookingId(bookingGroupCode);
            setShowRefundModal(true);
        } catch (error) {
            setNotEligibleMessage("Unfortunately, this booking is not eligible for a refund. If you believe this is a mistake or have questions, please contact our support team for assistance.");
            setShowNotEligibleModal(true);
        }
    };

    const handlePaymentConfirm = async (paymentId, razorpayOrderId, razorpaySignature) => {
        const token = await SecureStore.getItemAsync("token");

        const res = await dispatch(
            carPackageConfirmPayment({
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

    const getStatusStyle = (status) => {
        switch (status) {
            case 'CONFIRMED': return styles.statusConfirmed;
            case 'CANCELLED': return styles.statusCancelled;
            case 'PARTIALLY_CANCELLED': return styles.statusPartial;
            default: return styles.statusPending;
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.innerContainer}>
                {/* Filter Tabs */}
                <View style={styles.filterSection}>
                    <View style={styles.filterWrapper}>
                        {/* Tabs */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.tabsContainer}
                        >
                            {Object.keys(statusMap).map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    onPress={() => handleStatusChange(option)}
                                    style={[
                                        styles.tabButton,
                                        status === option ? styles.tabButtonActive : styles.tabButtonInactive,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.tabButtonText,
                                            status === option ? styles.tabButtonTextActive : styles.tabButtonTextInactive,
                                        ]}
                                    >
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Custom Dropdown */}
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
                                            {selectedDropdownOption || 'Select Option'}
                                        </Text>
                                        <MaterialIcons
                                            name={showDropdown ? 'arrow-drop-up' : 'arrow-drop-down'}
                                            size={24}
                                            color="#6b7280"
                                        />
                                    </TouchableOpacity>

                                    {/* Dropdown List */}
                                    {showDropdown && (
                                        <View style={styles.dropdownList}>
                                            {tabDropdownOptions[status]?.map((item) => (
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
                {carPackagebookingsLoading ? (
                    <View style={styles.loadingContainer}>
                        {[1, 2, 3].map((index) => (
                            <View key={index} style={styles.skeletonCard}>
                                <View style={styles.skeletonContent}>
                                    <View style={styles.skeletonLeft}>
                                        <View style={[styles.skeletonLine, { width: 160, height: 20 }]} />
                                        <View style={[styles.skeletonLine, { width: 240, height: 16, marginTop: 12 }]} />
                                        <View style={[styles.skeletonLine, { width: 192, height: 16, marginTop: 8 }]} />
                                    </View>
                                    <View style={styles.skeletonRight}>
                                        <View style={[styles.skeletonLine, { width: 96, height: 16 }]} />
                                        <View style={[styles.skeletonLine, { width: 80, height: 16, marginTop: 8 }]} />
                                    </View>
                                </View>
                                <View style={styles.skeletonButton}>
                                    <View style={[styles.skeletonLine, { width: 96, height: 32 }]} />
                                </View>
                            </View>
                        ))}
                    </View>
                ) : carPackagebookingsError ? (
                    /* Error State */
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconContainer}>
                            <MaterialIcons name="description" size={48} color="#9ca3af" />
                        </View>
                        <Text style={styles.emptyTitle}>No Data Available</Text>
                    </View>
                ) : carPackagebookings.content?.length > 0 ? (
                    /* Bookings List */
                    // <FlatList
                    //     data={carPackagebookings.content}
                    //     keyExtractor={(item) => item.bookingGroupCode}
                    //     scrollEnabled={false}
                    //     renderItem={({ item }) => (
                    //         <TouchableOpacity
                    //             style={styles.bookingCard}
                    //             onPress={() => toggleExpand(item.bookingGroupCode)}
                    //             activeOpacity={0.7}
                    //         >
                    //             {/* Booking Content */}
                    //             <View style={styles.bookingHeader}>
                    //                 <View style={styles.bookingHeaderLeft}>
                    //                     <Text style={styles.bookingId}>
                    //                         Booking ID: <Text style={styles.bookingIdBold}>{item.bookingGroupCode}</Text>
                    //                     </Text>

                    //                     {/* Package Name and Status */}
                    //                     <View style={styles.packageNameRow}>
                    //                         <Text style={styles.packageName}>{item.carPackageName}</Text>
                    //                         <View
                    //                             style={[
                    //                                 styles.statusBadge,
                    //                                 item.status === 'CONFIRMED' && styles.statusConfirmed,
                    //                                 item.status === 'CANCELLED' && styles.statusCancelled,
                    //                                 item.status === 'PARTIALLY_CANCELLED' && styles.statusPartial,
                    //                                 item.status === 'COMPLETED' && styles.statusCompleted,
                    //                             ]}
                    //                         >
                    //                             <Text style={styles.statusText}>{item.status.replace(/_/g, ' ')}</Text>
                    //                         </View>
                    //                     </View>

                    //                     {/* Car Details */}
                    //                     <View style={styles.carDetailsSection}>
                    //                         <Text style={styles.carDetails}>
                    //                             Car: {item.carModel} ({item.carType})
                    //                         </Text>
                    //                     </View>

                    //                     {/* Driver Details or Message */}
                    //                     <View style={styles.driverDetailsSection}>
                    //                         {item.carDetailsDTO ? (
                    //                             <Text style={styles.driverDetails}>
                    //                                 Driver Name: {item.carDetailsDTO.driverName}{'\n'}
                    //                                 Phone: {item.carDetailsDTO.driverNumber}{'\n'}
                    //                                 Car Number: {item.carDetailsDTO.carNumber}
                    //                             </Text>
                    //                         ) : (
                    //                             (() => {
                    //                                 const startDate = new Date(item.expiredAt);
                    //                                 const diffInDays = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
                    //                                 if (diffInDays <= 10 && diffInDays > 0) {
                    //                                     return (
                    //                                         <Text style={styles.driverMessage}>
                    //                                             The driver's contact details will be shared with you 10 days prior to
                    //                                             your start date
                    //                                         </Text>
                    //                                     );
                    //                                 }
                    //                                 return null;
                    //                             })()
                    //                         )}
                    //                     </View>
                    //                 </View>

                    //                 {/* Right Side Info */}
                    //                 <View style={styles.bookingHeaderRight}>
                    //                     <Text style={styles.infoText}>Journey Start: {item.journeyStartDate}</Text>
                    //                     <Text style={styles.infoText}>Duration: {item.duration}</Text>
                    //                     <Text style={styles.totalPrice}>Total: ₹{item.totalPrice}</Text>
                    //                 </View>
                    //             </View>

                    //             {/* Action Buttons */}
                    //             <View style={styles.actionButtonsContainer}>
                    //                 {item.status === 'CONFIRMED' && (
                    //                     <TouchableOpacity
                    //                         style={[styles.actionButton, styles.actionButtonDanger]}
                    //                         onPress={() => {
                    //                             const today = new Date();
                    //                             const checkInDate = new Date(item.checkIn);
                    //                             const diffTime = checkInDate - today;
                    //                             const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    //                             if (diffDays <= 10) {
                    //                                 setPendingCancelBookingId(item.bookingGroupCode);
                    //                                 setShowNotEligibleConfirmModal(true);
                    //                             } else {
                    //                                 setShowCancelModal(true);
                    //                                 setCancelBookingId(item.bookingGroupCode);
                    //                                 setCancelReason('');
                    //                                 setShowCustomReason(false);
                    //                             }
                    //                         }}
                    //                     >
                    //                         <Text style={styles.actionButtonText}>Cancel Booking</Text>
                    //                     </TouchableOpacity>
                    //                 )}

                    //                 {(item.status === 'CANCELLED' || item.status === 'REJECTED') && (
                    //                     <TouchableOpacity
                    //                         style={[styles.actionButton, styles.actionButtonPrimary]}
                    //                         onPress={() => handleRefundStatus(item.bookingGroupCode)}
                    //                     >
                    //                         <Text style={styles.actionButtonText}>See Refund Status</Text>
                    //                     </TouchableOpacity>
                    //                 )}

                    //                 {item.status === 'PENDING' && now < new Date(item.expiredAt || Date.now()) && (
                    //                     <TouchableOpacity
                    //                         style={[styles.actionButton, styles.actionButtonSuccess]}
                    //                         // onPress={() => console.log('Pay Now')}
                    //                         onPress={async () => {
                    //                             const price = item.totalPrice || 0;
                    //                             const payNow = Math.max(499, price * 0.1);
                    //                             const remaining = price - payNow;
                    //                             setAmount(remaining)
                    //                             setNoOfDays(item.duration)
                    //                             const payment = item.payments;
                    //                             const pay = payment.filter(item => item.paymentType === "FINAL");
                    //                             const razorId = pay[0]?.razorpayOrderId;
                    //                             setTotal(item.numberOfGuests)
                    //                             setTravelDate(item.journeyStartDate)
                    //                             setBookingId(item.bookingGroupCode)
                    //                             await openRazorpay(razorId)
                    //                         }}
                    //                     >
                    //                         <Text style={styles.actionButtonText}>Pay Now</Text>
                    //                     </TouchableOpacity>
                    //                 )}

                    //                 {item.status === 'AWAITING_CUSTOMER_PAYMENT' &&
                    //                     now < new Date(item.expiredAt || Date.now()) && (
                    //                         <>
                    //                             <TouchableOpacity
                    //                                 style={[styles.actionButton, styles.actionButtonDanger]}
                    //                                 onPress={() => {
                    //                                     setShowCancelModal(true);
                    //                                     setCancelBookingId(item.bookingGroupCode);
                    //                                     setCancelReason('');
                    //                                     setShowCustomReason(false);
                    //                                 }}
                    //                             >
                    //                                 <Text style={styles.actionButtonText}>Cancel</Text>
                    //                             </TouchableOpacity>
                    //                             <TouchableOpacity
                    //                                 style={[styles.actionButton, styles.actionButtonSuccess]}
                    //                                 // onPress={() => console.log('Pay Now')}
                    //                                 onPress={async () => {
                    //                                     const price = item.totalPrice || 0;
                    //                                     const payNow = Math.max(499, price * 0.1);
                    //                                     const remaining = price - payNow;
                    //                                     setAmount(remaining)
                    //                                     setNoOfDays(item.duration)
                    //                                     const payment = item.payments;
                    //                                     const pay = payment.filter(item => item.paymentType === "FINAL");
                    //                                     const razorId = pay[0]?.razorpayOrderId;
                    //                                     setTotal(item.numberOfGuests)
                    //                                     setTravelDate(item.journeyStartDate)
                    //                                     setBookingId(item.bookingGroupCode)
                    //                                     await openRazorpay(razorId)
                    //                                 }}
                    //                             >
                    //                                 <Text style={styles.actionButtonText}>Pay Now</Text>
                    //                             </TouchableOpacity>
                    //                         </>
                    //                     )}
                    //             </View>
                    //         </TouchableOpacity>
                    //     )}
                    // />
                    <FlatList
                        data={carPackagebookings.content}
                        keyExtractor={(item) => item.bookingGroupCode}
                        scrollEnabled={false}
                        renderItem={({ item }) => {
                            const isExpanded = expandedId === item.bookingGroupCode;

                            return (
                                <View style={styles.bookingCardContainer}>
                                    <TouchableOpacity
                                        style={styles.bookingCard}
                                        onPress={() => toggleExpand2(item.bookingGroupCode)}
                                        activeOpacity={0.9}
                                    >
                                        {/* Main Header Row */}
                                        <View style={styles.bookingHeader}>
                                            <View style={styles.bookingHeaderLeft}>
                                                <Text style={styles.bookingId}>
                                                    Booking ID: <Text style={styles.bookingIdBold}>{item.bookingGroupCode}</Text>
                                                </Text>
                                                <View style={styles.packageNameRow}>
                                                    <Text style={styles.packageName}>{item.carPackageName}</Text>
                                                    <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                                                        <Text style={styles.statusText}>{item.status.replace(/_/g, ' ')}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.carInfoRow}>
                                                    <Icon name="car" size={14} color="#64748b" />
                                                    <Text style={styles.carDetailsText}>
                                                        {item.carModel} • {item.carType}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View style={styles.bookingHeaderRight}>
                                                <Text style={styles.totalPrice}>₹{item.totalPrice}</Text>
                                                <Icon
                                                    name={isExpanded ? "chevron-up" : "chevron-down"}
                                                    size={14}
                                                    color="#94a3b8"
                                                />
                                            </View>
                                        </View>

                                        {/* Collapsible Content */}
                                        {isExpanded && (
                                            <View style={styles.collapsibleContent}>
                                                <View style={styles.divider} />

                                                <View style={styles.infoGrid}>
                                                    <View style={styles.infoItem}>
                                                        <Icon name="calendar-alt" size={14} color="#3b82f6" />
                                                        <Text style={styles.infoValue}>Start: {item.journeyStartDate}</Text>
                                                    </View>
                                                    <View style={styles.infoItem}>
                                                        <Icon name="clock" size={14} color="#3b82f6" />
                                                        <Text style={styles.infoValue}>Duration: {item.duration}</Text>
                                                    </View>
                                                </View>

                                                {/* Driver Details Section */}
                                                <View style={styles.detailsBox}>
                                                    <Text style={styles.sectionLabel}>Service Details</Text>
                                                    {item.carDetailsDTO ? (
                                                        <View style={styles.driverCard}>
                                                            <Text style={styles.driverText}><Icon name="user" size={12} /> {item.carDetailsDTO.driverName}</Text>
                                                            <Text style={styles.driverText}><Icon name="phone" size={12} /> {item.carDetailsDTO.driverNumber}</Text>
                                                            <Text style={styles.driverText}><Icon name="route" size={12} /> {item.carDetailsDTO.carNumber}</Text>
                                                        </View>
                                                    ) : (
                                                        <Text style={styles.driverMessage}>
                                                            <Icon name="info-circle" size={12} color="#3b82f6" /> Driver details shared 10 days before start.
                                                        </Text>
                                                    )}
                                                </View>

                                                {/* Pay Now Button (if pending) */}
                                                {item.status === 'PENDING' && (
                                                    <TouchableOpacity
                                                        style={[styles.actionButton, styles.actionButtonSuccess, { marginTop: 10 }]}
                                                        onPress={() => openRazorpay(item)}
                                                    >
                                                        <Text style={styles.actionButtonText}>Complete Payment</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        )}
                                    </TouchableOpacity>

                                    {/* Specific Design Footer Cancel Button */}
                                    {item.status === 'CONFIRMED' && (
                                        <TouchableOpacity
                                            style={styles.listCancelButton}
                                            onPress={() => handleCancel(item)}
                                        >
                                            <Icon name="times-circle" size={16} color="#e11d48" />
                                            <Text style={styles.listCancelButtonText}>Cancel Booking</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            );
                        }}
                    />
                ) : (
                    /* Empty State */
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconContainer}>
                            <MaterialIcons name="description" size={48} color="#9ca3af" />
                        </View>
                        <Text style={styles.emptyTitle}>No Bookings Found</Text>
                        <Text style={styles.emptyDescription}>
                            {status === 'ALL'
                                ? "You haven't made any bookings yet. Start exploring car packages and make your first reservation!"
                                : `No ${selectedDropdownOption.toLowerCase()} ${status.toLowerCase()} bookings found.`}
                        </Text>
                        <TouchableOpacity style={styles.exploreButton} onPress={() => navigate('/')}>
                            <Text style={styles.exploreButtonText}>Explore Car Packages</Text>
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
                    <View style={styles.modalOverlay}>
                        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Cancel Booking</Text>
                            <Text style={styles.modalLabel}>Reason for cancellation:</Text>

                            <ScrollView style={styles.modalContent}>
                                {cancellationReasons.map((reason) => (
                                    <TouchableOpacity
                                        key={reason}
                                        style={styles.radioOption}
                                        onPress={() => handleReasonSelect(reason)}
                                    >
                                        <View
                                            style={[
                                                styles.radioCircle,
                                                cancelReason === reason && styles.radioCircleSelected,
                                            ]}
                                        >
                                            {cancelReason === reason && <View style={styles.radioInner} />}
                                        </View>
                                        <Text style={styles.radioText}>{reason}</Text>
                                    </TouchableOpacity>
                                ))}

                                {showCustomReason && (
                                    <View style={styles.customReasonContainer}>
                                        <TextInput
                                            style={styles.textArea}
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

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.modalButtonSecondary]}
                                    onPress={() => {
                                        setShowCancelModal(false);
                                        setShowCustomReason(false);
                                    }}
                                >
                                    <Text style={styles.modalButtonTextSecondary}>Close</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.modalButton,
                                        styles.modalButtonPrimary,
                                        (!cancelReason.trim() || cancelLoading) && styles.modalButtonDisabled,
                                    ]}
                                    disabled={cancelLoading || !cancelReason.trim()}
                                    onPress={handleCancelBooking}
                                >
                                    <Text style={styles.modalButtonText}>
                                        {cancelLoading ? 'Cancelling...' : 'Submit'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </View>
                </Modal>

                {/* Refund Status Modal */}
                <Modal
                    visible={showRefundModal && refundStatusData !== null}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowRefundModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <ScrollView contentContainerStyle={styles.modalScrollContent}>
                            <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.modalContainerLarge}>
                                <Text style={styles.modalTitle}>Refund Status</Text>

                                {/* Progress Bar */}
                                <View style={styles.progressSection}>
                                    <View style={styles.progressLabels}>
                                        <View style={styles.progressLabelLeft}>
                                            <Ionicons name="time" size={20} color="#3b82f6" />
                                            <Text style={styles.progressText}>INITIATED</Text>
                                        </View>
                                        <View style={styles.progressLabelRight}>
                                            <Text style={styles.progressText}>COMPLETED</Text>
                                            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                                        </View>
                                    </View>

                                    <View style={styles.progressBar}>
                                        <View
                                            style={[
                                                styles.progressFill,
                                                styles.progressFillPrimary,
                                                {
                                                    width: refundStatusData?.refundStatus === 'COMPLETED' ? '100%' : '50%',
                                                },
                                            ]}
                                        />
                                    </View>

                                    <View style={styles.statusBadgeCenter}>
                                        <View
                                            style={[
                                                styles.statusBadgeLarge,
                                                refundStatusData?.refundStatus === 'COMPLETED' && styles.statusCompleted,
                                            ]}
                                        >
                                            <Text style={styles.statusText}>{refundStatusData?.refundStatus}</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Refund Details */}
                                <View style={styles.refundDetails}>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Cancel Reason:</Text>
                                        <Text style={styles.detailValue}>{refundStatusData?.cancelReason}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Refunded Amount:</Text>
                                        <Text style={styles.detailValueBold}>₹{refundStatusData?.refundAmount}</Text>
                                    </View>
                                </View>

                                <View style={styles.infoBox}>
                                    <Text style={styles.infoTextBlue}>
                                        Your refund will be processed within 5–7 business days.
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={[styles.modalButton, styles.modalButtonPrimary, { alignSelf: 'flex-end' }]}
                                    onPress={() => setShowRefundModal(false)}
                                >
                                    <Text style={styles.modalButtonText}>Close</Text>
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
                    <View style={styles.modalOverlay}>
                        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.modalContainer}>
                            <View style={styles.modalIconCenter}>
                                <Ionicons name="warning" size={64} color="#ef4444" />
                            </View>
                            <Text style={styles.modalTitle}>Not Eligible for Refund</Text>
                            <Text style={styles.modalDescription}>{notEligibleMessage}</Text>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonPrimary, { alignSelf: 'center' }]}
                                onPress={() => setShowNotEligibleModal(false)}
                            >
                                <Text style={styles.modalButtonText}>Close</Text>
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
                    <View style={styles.modalOverlay}>
                        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.modalContainer}>
                            <View style={styles.modalIconCenter}>
                                <Ionicons name="warning" size={64} color="#f59e0b" />
                            </View>
                            <Text style={styles.modalTitle}>Not Eligible for Refund</Text>
                            <Text style={styles.modalDescription}>
                                Cancellations within 10 days of check-in are not eligible for a refund. Do you want
                                to continue and cancel your booking anyway?
                            </Text>
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.modalButtonSecondary]}
                                    onPress={() => setShowNotEligibleConfirmModal(false)}
                                >
                                    <Text style={styles.modalButtonTextSecondary}>No, Go Back</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.modalButtonPrimary]}
                                    onPress={() => {
                                        setShowNotEligibleConfirmModal(false);
                                        setShowCancelModal(true);
                                        setCancelBookingId(pendingCancelBookingId);
                                        setCancelReason('');
                                        setShowCustomReason(false);
                                    }}
                                >
                                    <Text style={styles.modalButtonText}>Yes, Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </View>
                </Modal>

                {/* Pagination */}
                {!carPackagebookingsLoading &&
                    !carPackagebookingsError &&
                    carPackagebookings.content?.length > 0 && (
                        <View style={styles.paginationContainer}>
                            <TouchableOpacity
                                disabled={page === 0}
                                onPress={() => handlePageChange(page - 1)}
                                style={[styles.paginationButton, page === 0 && styles.paginationButtonDisabled]}
                            >
                                <Ionicons name="chevron-back" size={20} color={page === 0 ? '#9ca3af' : '#ffffff'} />
                                <Text
                                    style={[
                                        styles.paginationButtonText,
                                        page === 0 && styles.paginationButtonTextDisabled,
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
                                        styles.paginationButton,
                                        page === i ? styles.paginationButtonActive : styles.paginationButtonInactive,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.paginationButtonText,
                                            page === i && styles.paginationButtonTextActive,
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
                                    styles.paginationButton,
                                    page === totalPages - 1 && styles.paginationButtonDisabled,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.paginationButtonText,
                                        page === totalPages - 1 && styles.paginationButtonTextDisabled,
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
            </View>
            <CarPackageSuccessModal
                visible={showSuccess}
                bookingId={bookingId}
                paidAt={paidAt}
                total={amount}
                travelDate={travelDate}
                numberofdays={noOfDays}
                onClose={() => {
                    setShowSuccess(false);
                    // navigation.navigate("hotelsSearch");
                    setStatus('Upcoming')
                    fetchBookings(page, "CONFIRMED");

                }}
            />
            <PaymentFailedModal
                visible={showFailure}
                onClose={() => {
                    setShowFailure(false)
                    // navigation.navigate("hotelsSearch");
                    fetchBookings(page, "CONFIRMED");
                }}
            />
        </ScrollView>
    )
}

export default MyCarPackageBookings

export const styles = StyleSheet.create({
    // Container
    container: {
        flex: 1,
        // backgroundColor: '#f9fafb',
    },
    contentContainer: {
        paddingTop: 20,
        paddingBottom: 10,
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

    // Custom Dropdown Styles
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 8,
    },
    dropdownButtonText: {
        fontSize: 14,
        color: '#374151',
    },
    dropdownList: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        marginTop: 4,
        overflow: 'hidden',
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    dropdownItemText: {
        fontSize: 14,
        color: '#374151',
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
    // ... existing styles ...
    bookingCardContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    bookingCard: {
        padding: 16,
        backgroundColor: '#ffffff',
    },
    collapsibleContent: {
        marginTop: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginVertical: 12,
    },
    infoGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoValue: {
        fontSize: 13,
        color: '#475569',
    },
    detailsBox: {
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 8,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#94a3b8',
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    driverText: {
        fontSize: 14,
        color: '#1e293b',
        marginBottom: 4,
    },
    carInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    carDetailsText: {
        fontSize: 13,
        color: '#64748b',
    },
    listCancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        backgroundColor: '#fff1f2',
        borderTopWidth: 1,
        borderTopColor: '#ffe4e6',
    },
    listCancelButtonText: {
        color: '#e11d48',
        fontWeight: '700',
        fontSize: 13,
        marginLeft: 8,
    },
    bookingCard: {
        // borderWidth: 1,
        borderColor: '#e5e7eb',
        padding: 16,
        // borderRadius: 12,
        backgroundColor: '#ffffff',
        // marginBottom: 16,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 1 },
        // shadowOpacity: 0.05,
        // shadowRadius: 2,
        // elevation: 1,
    },
    bookingHeader: {
        flexDirection: 'row',
        gap: 16,
    },
    bookingHeaderLeft: {
        flex: 1,
    },
    bookingHeaderRight: {
        alignItems: 'flex-end',
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

    // Package Name Row
    packageNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 8,
    },
    packageName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },

    // Car Details
    carDetailsSection: {
        marginBottom: 8,
    },
    carDetails: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1f2937',
    },

    // Driver Details
    driverDetailsSection: {
        marginBottom: 8,
    },
    driverDetails: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1f2937',
        lineHeight: 20,
    },
    driverMessage: {
        fontSize: 15,
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

    // Info Box
    infoBox: {
        backgroundColor: '#eff6ff',
        borderWidth: 1,
        borderColor: '#bfdbfe',
        borderRadius: 8,
        padding: 16,
        marginBottom: 24,
    },
    infoTextBlue: {
        fontSize: 14,
        color: '#1e40af',
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