// import { StyleSheet, Text, View, Dimensions, ScrollView } from 'react-native'
// import React, { useState } from 'react'
// import TabButton from "./MainPageComponents/TabButton"
// import HotelBookings from './BookingsComponents/HotelBookings'
// import MyTourQueries from './BookingsComponents/MyTourQueries'
// import MyCarPackageBookings from './BookingsComponents/MyCarPackageBookings'
// import MyCarPickupBookings from './BookingsComponents/MyCarPickupBookings'


// const { height } = Dimensions.get('window');

// const Bookings = () => {
//   const [activeTab, setActiveTab] = useState('hotels');

//   const renderTab = () => {
//     if (activeTab === 'hotels') {
//       return (
//         <HotelBookings />
//       )
//     } else if (activeTab === 'packages') {
//       return (
//         <MyTourQueries />
//       )
//     } else if (activeTab === 'cars') {
//       return (
//         <MyCarPackageBookings />
//       )
//     } else if (activeTab === 'carspickup'){
//       return (
//         <MyCarPickupBookings />
//       )
//     }
//   }
//   return (
//     <ScrollView style={styles.container} contentContainerStyle={styles.innerContainer}>
//       <View style={styles.banner}>
//         <Text style={styles.bannerTitle}>My Bookings</Text>
//         <View style={styles.tabRow}>
//           <TabButton icon="box-open" label="Package" onPress={() => setActiveTab('packages')} isActive={activeTab === 'packages'} />
//           <TabButton icon="hotel" label="Hotels" onPress={() => setActiveTab('hotels')} isActive={activeTab === 'hotels'} />
//           <TabButton icon="car" label="Cars" onPress={() => setActiveTab('cars')} isActive={activeTab === 'cars'} />
//           <TabButton icon="car" label="Pickup" onPress={() => setActiveTab('carspickup')} isActive={activeTab === 'carspickup'} />
//         </View>
//       </View>
//       {renderTab()}
//     </ScrollView>
//   )
// }

// export default Bookings

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#fff',
//     flex: 1,
//   },
//   innerContainer: {
//     alignItems: 'center',
//     paddingBottom: 50,
//   },
//   banner: {
//     height: height * 0.14,
//     width: '100%',
//     backgroundColor: '#2196F3',
//     justifyContent: 'center',
//     paddingHorizontal: 20,
//     paddingTop: 40,
//   },
//   bannerTitle: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginBottom: 10,
//     display: 'flex',
//     justifyContent: 'center'
//   },
//   tabRow: {
//     flexDirection: 'row',
//     // justifyContent: 'space-around',
//   },
//   tabButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//   },
//   activeTabButton: {
//     backgroundColor: '#fff',
//   },
//   tabText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   activeTabText: {
//     color: '#555',
//   },
//   searchBox: {
//     backgroundColor: '#fff',
//     width: '90%',
//     borderRadius: 16,
//     padding: 20,
//     marginTop: 20,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//     elevation: 5,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     color: '#000',
//   },
//   label: {
//     fontWeight: '600',
//     marginTop: 10,
//     color: '#333',
//   },
//   input: {
//     borderColor: '#ddd',
//     borderWidth: 1,
//     borderRadius: 12,
//     padding: 12,
//     marginTop: 5,
//     fontSize: 16,
//     color: '#000',
//   },
//   searchButton: {
//     marginTop: 20,
//     backgroundColor: '#1976D2',
//     borderRadius: 12,
//     paddingVertical: 14,
//     alignItems: 'center',
//   },
//   searchButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   placeholderText: {
//     color: '#888',
//   },
//   inputText: {
//     color: '#000',
//   },
//   input2: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   menuContent: {
//     backgroundColor: '#f9f9f9',
//     borderRadius: 8,
//     paddingVertical: 4,
//     elevation: 4, // Android shadow
//     shadowColor: '#000', // iOS shadow
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//   },
//   menuItemText: {
//     fontSize: 16,
//     color: '#333',
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: "white",
//     padding: 20,
//   },
//   modalHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   closeText: {
//     fontSize: 24,
//     color: "#0ea5e9",
//     marginRight: 10,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#1e293b",
//   },
//   modalInput: {
//     borderWidth: 1,
//     borderColor: "#cbd5e1",
//     borderRadius: 8,
//     padding: 10,
//     color: "#1e293b",
//     marginBottom: 15,
//   },
//   suggestionItem: {
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e2e8f0",
//   },
//   suggestionText: {
//     fontSize: 16,
//     color: "#1e293b",
//   },
//   noResult: {
//     textAlign: "center",
//     color: "#94a3b8",
//     marginTop: 20,
//   },
// });
import { StyleSheet, Text, View, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Added for icons
import TabButton from "./MainPageComponents/TabButton";
import HotelBookings from './BookingsComponents/HotelBookings';
import MyTourQueries from './BookingsComponents/MyTourQueries';
import MyCarPackageBookings from './BookingsComponents/MyCarPackageBookings';
import MyCarPickupBookings from './BookingsComponents/MyCarPickupBookings';

const { height, width } = Dimensions.get('window');

const Bookings = () => {
  const [activeTab, setActiveTab] = useState('hotels');

  const renderTab = () => {
    switch (activeTab) {
      case 'hotels':
        return <HotelBookings />;
      case 'packages':
        return <MyTourQueries />;
      case 'cars':
        return <MyCarPackageBookings />;
      case 'carspickup':
        return <MyCarPickupBookings />;
      default:
        return <HotelBookings />;
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. STATIC HEADER (Outside ScrollView) */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>My Bookings</Text>
        <View style={styles.tabRow}>
          <TabButton
            icon="box-open"
            label="Package"
            onPress={() => setActiveTab('packages')}
            isActive={activeTab === 'packages'}
          />
          <TabButton
            icon="hotel"
            label="Hotels"
            onPress={() => setActiveTab('hotels')}
            isActive={activeTab === 'hotels'}
          />
          <TabButton
            icon="car"
            label="Cars"
            onPress={() => setActiveTab('cars')}
            isActive={activeTab === 'cars'}
          />
          <TabButton
            icon="route"
            label="Pickup"
            onPress={() => setActiveTab('carspickup')}
            isActive={activeTab === 'carspickup'}
          />
        </View>
      </View>

      {/* 2. SCROLLABLE CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.innerContainer}
      >
        <View style={styles.tabContentWrapper}>
          {renderTab()}
        </View>
      </ScrollView>
    </View>
  );
};

export default Bookings;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc', // Slightly off-white for better card contrast
    flex: 1,
  },
  banner: {
    height: height * 0.14, // Fixed height for static header
    width: '100%',
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 45,
    // Add a shadow to show separation from scrolling content
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    zIndex: 100,
  },
  bannerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  tabRow: {
    flexDirection: 'row',
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  innerContainer: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  tabContentWrapper: {
    width: '100%',
    // paddingTop: 10,
  },
  // Reusable card styles for your children components to match
  bookingCardContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    marginLeft: 6,
  }
});