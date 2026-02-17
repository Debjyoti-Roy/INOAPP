// import {
//     StyleSheet,
//     Text,
//     View,
//     ScrollView,
//     Dimensions,
//     Pressable,
//     TouchableOpacity,
// } from "react-native";
// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import * as SecureStore from "expo-secure-store";
// import { fetchUserQueries } from "../../Redux/profileSlice";
// import { QueryStatus } from "./statusEnum";
// import Svg, { Path } from 'react-native-svg';
// import { useNavigation } from "@react-navigation/native";

// const { height } = Dimensions.get('window');
// const { width } = Dimensions.get("window");

// const Myqueries = () => {
//     const navigation = useNavigation();
//     const [activeTab, setActiveTab] = useState(QueryStatus.OPEN);
//     const [currentPage, setCurrentPage] = useState(0);
//     const [expandedCards, setExpandedCards] = useState({});
//     const dispatch = useDispatch();
//     const { queries, queriesLoading, queriesError } = useSelector(
//         (state) => state.profile
//     );

//     useEffect(() => {
//         const job = async () => {
//             const token = await SecureStore.getItemAsync("token");
//             dispatch(
//                 fetchUserQueries({
//                     token,
//                     page: currentPage,
//                     size: 5,
//                     status: activeTab,
//                 })
//             );
//         };
//         job();
//     }, [activeTab, currentPage]);

//     const toggleExpand = (id) => {
//         setExpandedCards((prev) => ({
//             ...prev,
//             [id]: !prev[id],
//         }));
//     };

//     const content = queries?.content || [];
//     const totalPages = queries?.totalPages || 1;
//     const pageNumber = queries?.pageNumber || 0;

//     const statuses = [
//         QueryStatus.ALL,
//         QueryStatus.OPEN,
//         QueryStatus.IN_PROGRESS,
//         QueryStatus.RESOLVED,
//         QueryStatus.CLOSED,
//     ];

//     const truncate = (text, limit = 100) => {
//         if (!text) return "";
//         return text.length > limit ? text.slice(0, limit) + "..." : text;
//     };

//     const formatRelativeTime = (dateStr) => {
//         const date = new Date(dateStr);
//         const now = new Date();
//         const diffMs = now - date;
//         const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

//         if (diffDays === 0) return "Today";
//         if (diffDays === 1) return "1 day ago";
//         return `${diffDays} days ago`;
//     };

//     return (
//         <View style={styles.container}>
//             {/* Header */}
//             {/* <View style={styles.banner}>
//                 <Text style={styles.bannerTitle}>Your Queries</Text>
//             </View> */}
//             <View style={styles.banner}>
//                 <View style={styles.bannerRow}>
//                     <Pressable onPress={() => navigation.goBack()}>
//                         <Svg
//                             width={22}
//                             height={22}
//                             viewBox="0 0 24 24"
//                             fill="none"
//                             stroke="white"
//                             strokeWidth={2}
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                         >
//                             <Path d="M12 19l-7-7 7-7" />
//                         </Svg>
//                     </Pressable>

//                     <Text style={styles.bannerTitle}>Your Queries</Text>
//                 </View>
//             </View>

//             {/* Content */}
//             <View style={{flex:1}}>
//                 <ScrollView style={{ marginTop: 15, width: width * 0.90, justifyContent: "center" }}>
//                     <ScrollView
//                         // style={{width:width*0.90, justifyContent:"center"}}
//                         horizontal
//                         showsHorizontalScrollIndicator={false}
//                         contentContainerStyle={styles.tabsContainer}
//                     >
//                         {statuses.map((status) => (
//                             <TouchableOpacity
//                                 key={status}
//                                 onPress={() => {
//                                     setActiveTab(status);
//                                     setCurrentPage(0);
//                                 }}
//                                 style={[
//                                     styles.tabButton,
//                                     activeTab === status
//                                         ? styles.tabButtonActive
//                                         : styles.tabButtonInactive,
//                                 ]}
//                             >
//                                 <Text
//                                     style={[
//                                         styles.tabButtonText,
//                                         activeTab === status
//                                             ? styles.tabButtonTextActive
//                                             : styles.tabButtonTextInactive,
//                                     ]}
//                                 >
//                                     {status.replace("_", " ")}
//                                 </Text>
//                             </TouchableOpacity>
//                         ))}
//                     </ScrollView>
//                     {queriesLoading && <Text>Loading queries...</Text>}
//                     {queriesError && <Text style={{ color: "red" }}>{queriesError}</Text>}

//                     {!queriesLoading && content.length > 0 ? (
//                         content.map((item) => (
//                             <Pressable
//                                 key={item.ticketId}
//                                 onPress={() => toggleExpand(item.ticketId)}
//                                 style={styles.card}
//                             >
//                                 {/* Left */}
//                                 <View style={{ flex: 1 }}>
//                                     <Text style={styles.ticketId}>
//                                         Ticket ID: <Text style={{ fontWeight: "600" }}>{item.ticketId}</Text>
//                                     </Text>

//                                     <Text style={styles.subject}>{item.subject}</Text>

//                                     <Text style={styles.message}>
//                                         {expandedCards[item.ticketId]
//                                             ? item.message
//                                             : truncate(item.message, 100)}
//                                     </Text>
//                                 </View>

//                                 {/* Right */}
//                                 <View style={styles.rightSection}>
//                                     <Text style={[styles.badge, styles[item.status]]}>
//                                         {item.status.replace("_", " ")}
//                                     </Text>
//                                     <Text style={styles.dateText}>
//                                         Created: {new Date(item.createdAt).toDateString()}
//                                     </Text>
//                                     <Text style={styles.dateText}>
//                                         Updated: {formatRelativeTime(item.updatedAt)}
//                                     </Text>
//                                 </View>
//                             </Pressable>
//                         ))
//                     ) : (
//                         !queriesLoading && <Text>No queries found.</Text>
//                     )}
//                 </ScrollView>
//             </View>

//             {/* Pagination */}
//             <View style={styles.pagination}>
//                 <TouchableOpacity
//                     disabled={pageNumber === 0}
//                     onPress={() => setCurrentPage((prev) => prev - 1)}
//                     style={[styles.pageButton, pageNumber === 0 && styles.disabledBtn]}
//                 >
//                     <Text>← Prev</Text>
//                 </TouchableOpacity>

//                 <Text>
//                     Page {pageNumber + 1} of {totalPages}
//                 </Text>

//                 <TouchableOpacity
//                     disabled={pageNumber + 1 >= totalPages}
//                     onPress={() => setCurrentPage((prev) => prev + 1)}
//                     style={[
//                         styles.pageButton,
//                         pageNumber + 1 >= totalPages && styles.disabledBtn,
//                     ]}
//                 >
//                     <Text>Next →</Text>
//                 </TouchableOpacity>
//             </View>
//         </View>
//     );
// };

// export default Myqueries;

// const styles = StyleSheet.create({
//     container: {

//         flex: 1,
//         backgroundColor: "#fff",
//     },
//     banner: {
//         height: height * 0.105,
//         width: '100%',
//         backgroundColor: '#2196F3',
//         justifyContent: 'center',
//         paddingHorizontal: 20,
//         paddingTop: 40,
//     },
//     bannerRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 12,
//     },
//     bannerTitle: {
//         fontSize: 20,
//         fontWeight: 'bold',
//         color: '#fff',
//     },


//     heading: {
//         fontSize: 28,
//         fontWeight: "700",
//     },

//     tabsContainer: {
//         flexDirection: "row",
//         gap: 8,
//         paddingVertical: 4,
//         paddingHorizontal: 2,
//         marginBottom: 15,
//     },

//     tabButton: {
//         paddingHorizontal: 16,
//         paddingVertical: 8,
//         borderRadius: 8,
//         minWidth: 80,
//         alignItems: "center",
//         justifyContent: "center",
//     },

//     tabButtonActive: {
//         backgroundColor: "#2563eb",
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.15,
//         shadowRadius: 4,
//         elevation: 3,
//     },

//     tabButtonInactive: {
//         backgroundColor: "#f3f4f6",
//     },

//     tabButtonText: {
//         fontSize: 14,
//         fontWeight: "600",
//     },

//     tabButtonTextActive: {
//         color: "#fff",
//     },

//     tabButtonTextInactive: {
//         color: "#374151",
//     },


//     card: {
//         padding: 16,
//         backgroundColor: "#fff",
//         borderRadius: 12,
//         elevation: 2,
//         marginBottom: 12,
//         flexDirection: "row",
//     },

//     ticketId: { fontSize: 12, color: "#666" },
//     subject: { fontSize: 16, fontWeight: "700", marginVertical: 4 },
//     message: { color: "#333", marginBottom: 4 },

//     rightSection: {
//         marginLeft: 12,
//         alignItems: "flex-end",
//     },

//     badge: {
//         paddingVertical: 4,
//         paddingHorizontal: 8,
//         borderRadius: 8,
//         fontSize: 10,
//         fontWeight: "600",
//         marginBottom: 8,
//         overflow: "hidden",
//     },

//     OPEN: { backgroundColor: "#d1fae5", color: "#065f46" },
//     IN_PROGRESS: { backgroundColor: "#fef3c7", color: "#92400e" },
//     RESOLVED: { backgroundColor: "#dbeafe", color: "#1e40af" },
//     CLOSED: { backgroundColor: "#e5e7eb", color: "#374151" },

//     dateText: { fontSize: 10, color: "#777" },

//     pagination: {
//         marginVertical: 20,
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "center",
//     },

//     pageButton: {
//         padding: 10,
//         backgroundColor: "#eee",
//         borderRadius: 8,
//     },

//     disabledBtn: {
//         opacity: 0.4,
//     },
// });
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Dimensions,
    Pressable,
    TouchableOpacity,
    SafeAreaView
} from "react-native";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as SecureStore from "expo-secure-store";
import { fetchUserQueries } from "../../Redux/profileSlice";
import { QueryStatus } from "./statusEnum";
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from "@react-navigation/native";

const { height, width } = Dimensions.get('window');

const Myqueries = () => {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState(QueryStatus.OPEN);
    const [currentPage, setCurrentPage] = useState(0);
    const [expandedCards, setExpandedCards] = useState({});
    const dispatch = useDispatch();

    const { queries, queriesLoading, queriesError } = useSelector(
        (state) => state.profile
    );

    useEffect(() => {
        const job = async () => {
            const token = await SecureStore.getItemAsync("token");
            dispatch(
                fetchUserQueries({
                    token,
                    page: currentPage,
                    size: 8,
                    status: activeTab,
                })
            );
        };
        job();
    }, [activeTab, currentPage]);

    const toggleExpand = (id) => {
        setExpandedCards((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const content = queries?.content || [];
    const totalPages = queries?.totalPages || 1;
    const pageNumber = queries?.pageNumber || 0;

    const statuses = [
        QueryStatus.ALL,
        QueryStatus.OPEN,
        QueryStatus.IN_PROGRESS,
        QueryStatus.RESOLVED,
        QueryStatus.CLOSED,
    ];

    const truncate = (text, limit = 100) => {
        if (!text) return "";
        return text.length > limit ? text.slice(0, limit) + "..." : text;
    };

    const formatRelativeTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "1 day ago";
        return `${diffDays} days ago`;
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.banner}>
                <View style={styles.bannerContent}>
                    <TouchableOpacity
                        onPress={() => navigation?.goBack()}
                        style={styles.backButton}
                    >
                        <Svg
                            width={24}
                            height={24}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth={2.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <Path d="M15 18l-6-6 6-6" />
                        </Svg>
                    </TouchableOpacity>
                    <Text style={styles.bannerText}>Your Queries</Text>
                </View>
            </View>

            {/* Tabs - Horizontal Scroll */}
            <View style={styles.tabsWrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsContainer}
                >
                    {statuses.map((status) => (
                        <TouchableOpacity
                            key={status}
                            onPress={() => {
                                setActiveTab(status);
                                setCurrentPage(0);
                            }}
                            style={[
                                styles.tabButton,
                                activeTab === status ? styles.tabButtonActive : styles.tabButtonInactive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.tabButtonText,
                                    activeTab === status ? styles.tabButtonTextActive : styles.tabButtonTextInactive,
                                ]}
                            >
                                {status.replace("_", " ")}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Main Content List */}
            <ScrollView contentContainerStyle={styles.scrollListContent}>
                {queriesLoading && <Text style={styles.infoText}>Loading queries...</Text>}
                {queriesError && <Text style={[styles.infoText, { color: "red" }]}>{queriesError}</Text>}

                {!queriesLoading && content.length > 0 ? (
                    content.map((item) => (
                        <Pressable
                            key={item.ticketId}
                            onPress={() => toggleExpand(item.ticketId)}
                            style={styles.card}
                        >
                            <View style={{ flex: 1 }}>
                                <Text style={styles.ticketId}>
                                    Ticket ID: <Text style={{ fontWeight: "600" }}>{item.ticketId}</Text>
                                </Text>
                                <Text style={styles.subject}>{item.subject}</Text>
                                <Text style={styles.message}>
                                    {expandedCards[item.ticketId] ? item.message : truncate(item.message, 100)}
                                </Text>
                            </View>

                            <View style={styles.rightSection}>
                                <Text style={[styles.badge, styles[item.status] || styles.CLOSED]}>
                                    {item.status.replace("_", " ")}
                                </Text>
                                <Text style={styles.dateText}>Created: {new Date(item.createdAt).toLocaleDateString()}</Text>
                                <Text style={styles.dateText}>Updated: {formatRelativeTime(item.updatedAt)}</Text>
                            </View>
                        </Pressable>
                    ))
                ) : (
                    !queriesLoading && <Text style={styles.infoText}>No queries found.</Text>
                )}
            </ScrollView>

            {/* Pagination Fixed at Bottom */}
            <View style={styles.pagination}>
                <TouchableOpacity
                    disabled={pageNumber === 0}
                    onPress={() => setCurrentPage((prev) => prev - 1)}
                    style={[styles.pageButton, pageNumber === 0 && styles.disabledBtn]}
                >
                    <Text style={styles.pageBtnText}>← Prev</Text>
                </TouchableOpacity>

                <Text style={styles.pageIndicator}>
                    Page {pageNumber + 1} of {totalPages}
                </Text>

                <TouchableOpacity
                    disabled={pageNumber + 1 >= totalPages}
                    onPress={() => setCurrentPage((prev) => prev + 1)}
                    style={[styles.pageButton, pageNumber + 1 >= totalPages && styles.disabledBtn]}
                >
                    <Text style={styles.pageBtnText}>Next →</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    // banner: {
    //     backgroundColor: '#2196F3',
    //     paddingTop: 60,
    //     paddingBottom: 20,
    //     paddingVertical: 10,
    //     paddingHorizontal: 20,
    //     elevation: 4,
    // },
    // bannerRow: {
    //     flexDirection: 'row',
    //     alignItems: 'center',
    // },
    // backBtn: {
    //     marginRight: 6,
    //     padding: 4,
    // },
    // bannerTitle: {
    //     fontSize: 20,
    //     fontWeight: 'bold',
    //     color: '#fff',
    // },
    banner: {
        backgroundColor: "#2196F3",
        paddingTop: 60, // Adjusted for SafeAreaView
        paddingVertical: 10,
        paddingHorizontal: 20,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    bannerContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    backButton: {
        marginRight: 12,
        padding: 4,
    },
    bannerText: { color: "white", fontSize: 20, fontWeight: "bold" },
    tabsWrapper: {
        marginTop: 15,
        height: 50,
    },
    tabsContainer: {
        paddingHorizontal: 16,
        alignItems: 'center',
        gap: 8,
    },
    tabButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    tabButtonActive: {
        backgroundColor: "#2196F3",
        borderColor: "#2196F3",
    },
    tabButtonInactive: {
        backgroundColor: "#fff",
    },
    tabButtonText: {
        fontSize: 13,
        fontWeight: "600",
    },
    tabButtonTextActive: {
        color: "#fff",
    },
    tabButtonTextInactive: {
        color: "#64748B",
    },
    scrollListContent: {
        paddingHorizontal: 20,
        paddingBottom: 100, // Space for pagination
        paddingTop: 10,
    },
    card: {
        padding: 16,
        backgroundColor: "#fff",
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        marginBottom: 12,
        flexDirection: "row",
    },
    ticketId: { fontSize: 11, color: "#94A3B8" },
    subject: { fontSize: 16, fontWeight: "700", color: '#1E293B', marginVertical: 4 },
    message: { color: "#475569", fontSize: 14, lineHeight: 20 },
    rightSection: {
        marginLeft: 12,
        alignItems: "flex-end",
        justifyContent: 'space-between',
    },
    badge: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
        fontSize: 10,
        fontWeight: "bold",
        overflow: "hidden",
        textAlign: 'center',
    },
    OPEN: { backgroundColor: "#DCFCE7", color: "#166534" },
    IN_PROGRESS: { backgroundColor: "#FEF3C7", color: "#92400E" },
    RESOLVED: { backgroundColor: "#DBEAFE", color: "#1E40AF" },
    CLOSED: { backgroundColor: "#F1F5F9", color: "#475569" },
    ALL: { backgroundColor: "#E0F2FE", color: "#0369A1" },
    dateText: { fontSize: 9, color: "#94A3B8", marginTop: 2 },
    infoText: { textAlign: 'center', marginTop: 20, color: '#64748B' },
    pagination: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingVertical: 15,
        paddingHorizontal: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    pageButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        backgroundColor: "#F1F5F9",
        borderRadius: 8,
    },
    pageBtnText: { fontWeight: '600', color: '#1E293B' },
    pageIndicator: { color: '#64748B', fontSize: 13 },
    disabledBtn: { opacity: 0.3 },
});

export default Myqueries;