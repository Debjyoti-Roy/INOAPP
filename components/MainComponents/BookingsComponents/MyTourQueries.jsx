import React, { useEffect, useRef, useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator 
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
// import { fetchUserTourPackageBookings } from "../../Redux/store/profileSlice";
import {fetchUserTourPackageBookings} from '../../Redux/profileSlice'
import * as SecureStore from "expo-secure-store";

const MyTourQueries = () => {
  const dispatch = useDispatch();
  const { tourPackageBookings, tourPackageBookingsLoading, tourPackageBookingsError } =
    useSelector((state) => state.profile);

  const [tabs, setTabs] = useState("New");
  const [size] = useState(10);
  const [pageNumber, setPageNumber] = useState(0);
  const [content, setContent] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    const job=async()=>{
        let status;
        if (tabs === "New") status = "OPEN,IN_PROGRESS";
        if (tabs === "Confirm") status = "RESOLVED";
        const token = await SecureStore.getItemAsync("token");
        dispatch(fetchUserTourPackageBookings({ page: pageNumber, size, status, token }));
    }
    job()
  }, [tabs, pageNumber]);

  useEffect(() => {
    setContent(tourPackageBookings?.content || []);
    setTotalPages(tourPackageBookings?.totalPages || 1);
    setPageNumber(tourPackageBookings?.pageNumber || 0);
  }, [tourPackageBookings]);

  const toggleExpand = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handlePrevPage = () => {
    if (pageNumber > 0) setPageNumber((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (pageNumber + 1 < totalPages) setPageNumber((prev) => prev + 1);
  };

  const truncate = (text, limit = 100) => {
    if (!text) return "";
    return text.length > limit ? text.slice(0, limit) + "..." : text;
  };

  const ticketCreatedAt = (date) => {
    if (!date) return "N/A";
    const parsed = new Date(date);
    return parsed.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
    <ScrollView style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setTabs("New")}
          style={[styles.tabBtn, tabs === "New" && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, tabs === "New" && styles.tabTextActive]}>New</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTabs("Confirm")}
          style={[styles.tabBtn, tabs === "Confirm" && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, tabs === "Confirm" && styles.tabTextActive]}>
            Confirmed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loader */}
      {tourPackageBookingsLoading && (
        <View style={{ paddingVertical: 50 }}>
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      )}

      {/* Error */}
      {tourPackageBookingsError && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No Data Available</Text>
        </View>
      )}

      {/* Content */}
      {!tourPackageBookingsLoading &&
        content &&
        content.map((item) => (
          <TouchableOpacity
            key={item.ticketId}
            onPress={() => toggleExpand(item.ticketId)}
            style={styles.card}
          >
            <View style={styles.cardRow}>
              <View style={styles.cardLeft}>
                <Text style={styles.ticketId}>Ticket ID: {item.ticketId}</Text>
                <Text style={styles.title}>{item.subject}</Text>

                <Text style={styles.message}>
                  {expandedCards[item.ticketId]
                    ? item.message
                    : truncate(item.message, 50)}
                </Text>
              </View>

              <View style={styles.cardRight}>
                <Text
                  style={[
                    styles.status,
                    item.status === "OPEN"
                      ? styles.statusOpen
                      : item.status === "IN_PROGRESS"
                        ? styles.statusProgress
                        : styles.statusResolved,
                  ]}
                >
                  {item.status.replace("_", " ")}
                </Text>

                <Text style={styles.dateSmall}>
                  Created at: {ticketCreatedAt(item.createdAt)}
                </Text>
                <Text style={styles.dateTiny}>
                  Updated: {formatRelativeTime(item.updatedAt)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

      {!tourPackageBookingsLoading && content.length === 0 && (
        <Text style={styles.noText}>No queries found.</Text>
      )}

      {/* Pagination */}
      <View style={styles.paginationRow}>
        <TouchableOpacity
          onPress={handlePrevPage}
          disabled={pageNumber === 0}
          style={[styles.pageBtn, pageNumber === 0 && styles.disabledBtn]}
        >
          <Text>← Prev</Text>
        </TouchableOpacity>

        <Text>
          Page {pageNumber + 1} of {totalPages}
        </Text>

        <TouchableOpacity
          onPress={handleNextPage}
          disabled={pageNumber + 1 >= totalPages}
          style={[
            styles.pageBtn,
            pageNumber + 1 >= totalPages && styles.disabledBtn,
          ]}
        >
          <Text>Next →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default MyTourQueries;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  tabContainer: {
    flexDirection: "row",
    marginBottom: 16,
    justifyContent: "center",
    marginTop:30
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    marginHorizontal: 5,
  },
  tabBtnActive: {
    backgroundColor: "#2563EB",
  },
  tabText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "white",
  },

  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 2,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardLeft: {
    width: "65%",
  },
  cardRight: {
    width: "30%",
    alignItems: "flex-end",
  },

  ticketId: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  message: {
    fontSize: 14,
    color: "#374151",
  },

  status: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 8,
    overflow: "hidden",
  },
  statusOpen: {
    backgroundColor: "#D1FAE5",
    color: "#065F46",
  },
  statusProgress: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
  },
  statusResolved: {
    backgroundColor: "#DBEAFE",
    color: "#1E40AF",
  },

  dateSmall: {
    fontSize: 10,
    color: "#6B7280",
  },
  dateTiny: {
    fontSize: 10,
    color: "#9CA3AF",
  },

  noText: {
    textAlign: "center",
    marginTop: 20,
    color: "#6B7280",
  },

  emptyBox: {
    alignItems: "center",
    paddingVertical: 30,
  },
  emptyTitle: {
    fontSize: 18,
    color: "#374151",
    fontWeight: "600",
  },

  paginationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    alignItems: "center",
  },
  pageBtn: {
    padding: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
  },
  disabledBtn: {
    opacity: 0.4,
  },
});
