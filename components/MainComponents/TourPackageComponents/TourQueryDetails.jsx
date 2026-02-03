import { sendPrivateEnquire, sendPublicEnquire } from "@/components/Redux/tourPackageSlice";
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    StyleSheet,
    Platform,
    KeyboardAvoidingView
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { useDispatch } from "react-redux";
import TourPackageSuccessModal from '../../ModalComponent/TourPackageSuccessModal'
import PaymentFailedModal from '../../ModalComponent/PaymentFailedModal'
import * as SecureStore from 'expo-secure-store';

const TourQueryDetails = ({ navigation, route }) => {
    const dispatch = useDispatch()
    const { bookingPrice, pkg, data, loggedIn = false, tourDetails } = route.params || {};
    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [numberofPeople, setNumberofPeople] = useState("");
    const [note, setNote] = useState("");
    const [errors, setErrors] = useState({});
    const [showFailure, setShowFailure] = useState(false);

    const [bookingId, setBookingId] = useState("")
    const [queryType, setQueryType] = useState()
    const [message, setMessage] = useState("")

    const [visible, setVisible] = useState(false)


    useEffect(() => {
        const detailsFields = async () => {

            const storedUser = await SecureStore.getItemAsync("userData");
            console.log("STORED USER IS>>>>", storedUser)
            if (storedUser) {
                const user = JSON.parse(storedUser)
                setName(user.name)
                if (user.phoneNumber !== "") {
                    setContact(user.phoneNumber)
                } else {
                    setContact(user.email)
                }
            } else {
                setName("")
                setContact("")
            }
        }
        detailsFields()
    }, [])

    useEffect(() => {
        console.log(name)
    }, [name])


    // const bookingPrice = pkg?.price || 0;

    const validate = () => {
        const newErrors = {};
        if (!name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!contact.trim()) {
            newErrors.contact = "Contact is required";
        } else {
            // Email regex OR phone regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phoneRegex = /^[0-9]{10}$/;
            if (!emailRegex.test(contact) && !phoneRegex.test(contact)) {
                newErrors.contact = "Enter a valid email or 10-digit phone number";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleEnquire = async () => {
        if (validate()) {
            const [day, month, year] = data.travelDate.split("-");
            const formattedDate = `${year}-${month}-${day}`;
            const data2 = {
                name: name,
                contact: contact,
                packageId: tourDetails.id,
                journeyDate: formattedDate,
                noOfPeople: numberofPeople,
                tourType: pkg.tourType,
                note: note
            }
            const token = await SecureStore.getItemAsync("token");
            if (token) {
                const push = await dispatch(sendPrivateEnquire({ token: token, body: data2 }))
                if (sendPrivateEnquire.fulfilled.match(push)) {
                    const pushedData = push.payload.data
                    setVisible(true)
                    setBookingId(pushedData.ticketId)
                    setQueryType(pushedData.queryType)
                    setMessage(pushedData.subject)
                } else {
                    setShowFailure(true)
                }
            } else {
                const push = await dispatch(sendPublicEnquire({ body: data }))
                if (sendPublicEnquire.fulfilled.match(push)) {
                    console.log(push.payload.data)
                    setVisible(true)
                    const pushedData = push.payload.data
                    setBookingId(pushedData.ticketId)
                    setQueryType(pushedData.queryType)
                } else {
                    setShowFailure(true)
                }

            }
        } else {
            console.log("HELLO2r")
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} // adjust if you have headers
            >
                <ScrollView
                    style={styles.scrollArea}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Package Details */}
                    <View style={styles.header}>
                        <View style={styles.titleRow}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                                <Svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width={22}
                                    height={22}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#1e293b"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <Path d="M12 19l-7-7 7-7" />
                                </Svg>
                            </TouchableOpacity>

                            <Text style={styles.pkgTitle}>{pkg?.tourType} Package</Text>
                        </View>

                        <View style={styles.badgeContainer}>
                            {pkg?.carTypes && (
                                <View
                                    style={[
                                        styles.badge,
                                        { backgroundColor: "#EBF4FF", borderColor: "#BFDBFE" },
                                    ]}
                                >
                                    <Text style={[styles.badgeText, { color: "#1E40AF" }]}>{pkg.carTypes}</Text>
                                </View>
                            )}
                            {pkg?.hotelType && (
                                <View
                                    style={[
                                        styles.badge,
                                        { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" },
                                    ]}
                                >
                                    <Text style={[styles.badgeText, { color: "#047857" }]}>{pkg.hotelType}</Text>
                                </View>
                            )}
                        </View>
                    </View>


                    {/* Images */}
                    <View style={[styles.section, { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }]}>
                        {pkg?.sampleCarImageUrls?.[0] && (
                            <View style={styles.imageBox}>
                                <Image source={{ uri: pkg.sampleCarImageUrls[0] }} style={styles.image} />
                                <Text style={styles.imageLabel}>Car Sample</Text>
                            </View>
                        )}
                        {pkg?.sampleHotelImageUrls?.[0] && (
                            <View style={styles.imageBox}>
                                <Image source={{ uri: pkg.sampleHotelImageUrls[0] }} style={styles.image} />
                                <Text style={styles.imageLabel}>Hotel Sample</Text>
                            </View>
                        )}
                    </View>

                    {/* User Info */}
                    <View style={styles.section}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Name</Text>
                            <TextInput
                                style={[styles.input, errors.name && styles.errorInput]}
                                value={name}
                                onChangeText={setName}
                                editable={!loggedIn}
                            />
                            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Contact (Email or Phone)</Text>
                            <TextInput
                                style={[styles.input, errors.contact && styles.errorInput]}
                                value={contact}
                                onChangeText={setContact}
                                editable={!loggedIn}
                            />
                            {errors.contact && <Text style={styles.errorText}>{errors.contact}</Text>}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Number of People</Text>
                            <TextInput
                                style={[styles.input, errors.numberofPeople && styles.errorInput]}
                                value={numberofPeople.toString()}
                                onChangeText={setNumberofPeople}
                                keyboardType="numeric"
                            />
                            {errors.numberofPeople && (
                                <Text style={styles.errorText}>{errors.numberofPeople}</Text>
                            )}
                        </View>
                    </View>

                    {/* Special Request */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Any Special Request? (Optional)</Text>
                        <TextInput
                            style={[styles.input, { height: 90, textAlignVertical: "top" }]}
                            value={note}
                            onChangeText={setNote}
                            placeholder="Add any special requests or notes..."
                            multiline
                        />
                    </View>

                    {/* Price */}
                    <View style={[styles.section, styles.priceBox]}>
                        <Text style={styles.priceTitle}>Price</Text>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Price per Person</Text>
                            <Text style={styles.priceValue}>₹{bookingPrice.toLocaleString()}</Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, styles.cancelBtn]}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={[styles.btnText, { color: "#374151" }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.button,
                        styles.enquireBtn,
                        (!name || !contact || !numberofPeople || numberofPeople <= 0) && { opacity: 0.5 },
                    ]}
                    disabled={!name || !contact || !numberofPeople || numberofPeople <= 0}
                    onPress={handleEnquire}
                >
                    <Text style={styles.btnText}>Enquire</Text>
                </TouchableOpacity>
            </View>
            <TourPackageSuccessModal
                visible={visible}
                bookingId={bookingId}
                queryType={queryType}
                total={bookingPrice.toLocaleString()}
                numberofpeople={numberofPeople}
                travelDate={data.travelDate}
                message={message}
                onClose={() => {
                    setVisible(false);
                    navigation.navigate("hotelsSearch");
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
    );
};

export default TourQueryDetails;

const styles = StyleSheet.create({
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    iconButton: {
        padding: 6,
        marginRight: 8, // small space between icon and text
        // backgroundColor: "#1E3A8A", // optional, for visibility
        borderRadius: 999,
    },
    pkgTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#111827",
    },

    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    header: {
        marginBottom: 16,
        marginTop: 30,
    },
    headerTitle: {
        color: "white",
        fontSize: 18,
        fontWeight: "600",
    },
    scrollArea: {
        flex: 1,
        paddingTop: 16,
        paddingHorizontal: 12,
    },
    section: {
        backgroundColor: "white",
        marginBottom: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    // pkgTitle: {
    //     fontSize: 22,
    //     fontWeight: "700",
    //     color: "#111827",
    //     marginBottom: 6,
    // },
    badgeContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    badge: {
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginRight: 8,
    },
    badgeText: {
        fontSize: 13,
        fontWeight: "500",
    },
    imageBox: {
        width: "48%",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        overflow: "hidden",
        marginBottom: 12,
    },
    image: {
        width: "100%",
        height: 140,
    },
    imageLabel: {
        textAlign: "center",
        paddingVertical: 6,
        color: "#374151",
        fontWeight: "500",
    },
    inputGroup: {
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        color: "#374151",
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        backgroundColor: "white",
    },
    errorInput: {
        borderColor: "#EF4444",
    },
    errorText: {
        color: "#EF4444",
        fontSize: 13,
        marginTop: 2,
    },
    priceBox: {
        backgroundColor: "#F3F4F6",
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },
    priceTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    priceLabel: {
        fontSize: 15,
        color: "#374151",
    },
    priceValue: {
        fontSize: 18,
        fontWeight: "700",
        color: "#16A34A",
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
        marginHorizontal: 5,
    },
    cancelBtn: {
        backgroundColor: "#F3F4F6",
    },
    enquireBtn: {
        backgroundColor: "#2563EB",
    },
    btnText: {
        fontSize: 16,
        fontWeight: "600",
        color: "white",
    },
});