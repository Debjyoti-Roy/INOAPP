import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { Svg, Path, Rect, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Native SVG wrappers to ensure they render on mobile
const HotelIcon = () => (
  <Svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
    <Path d="M10 22v-6.57M12 11h.01M12 7h.01M14 15.43V22" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M15 16a5 5 0 0 0-6 0M16 11h.01M16 7h.01M8 11h.01M8 7h.01" strokeLinecap="round" strokeLinejoin="round"/>
    <Rect x="4" y="2" width="16" height="20" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const CarIcon = () => (
  <Svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
    <Path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8" strokeLinecap="round" strokeLinejoin="round"/>
    <Rect width="18" height="8" x="3" y="10" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M5 18v2M19 18v2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const TravelIcon = () => (
  <Svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
    <Rect x="6" y="7" width="12" height="13" rx="2" />
    <Path d="M10 7V4a2 2 0 0 1 4 0v3M12 7v13" strokeLinecap="round" />
    <Circle cx="9" cy="21" r="1" fill="white" />
    <Circle cx="15" cy="21" r="1" fill="white" />
  </Svg>
);

const About = () => {
  const cardData = [
    {
      icon: <HotelIcon />,
      title: "Hotels",
      desc: "Find the best hotels at unbeatable prices.",
      bg: "#3b82f6",
    },
    {
      icon: <CarIcon />,
      title: "Cars",
      desc: "Book rentals and travel with total comfort.",
      bg: "#a855f7",
    },
    {
      icon: <TravelIcon />,
      title: "Packages",
      desc: "Curated holiday packages for memories.",
      bg: "#f59e0b",
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        About <Text style={styles.highlight}>InoHub</Text>
      </Text>
      
      <Text style={styles.description}>
        At <Text style={styles.boldBlue}>InoHub</Text>, we believe that every journey should be as unique as you are. 
        Focus on making memories, we’ll handle the details.
      </Text>

      <View style={styles.grid}>
        {cardData.map((card, idx) => (
          <View key={idx} style={styles.card}>
            <View style={[styles.iconBg, { backgroundColor: card.bg }]}>
              {card.icon}
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardDesc}>{card.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width * 0.9,
    marginTop: 30,
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 10,
  },
  highlight: {
    color: '#2196F3',
  },
  description: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  boldBlue: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  grid: {
    width: '100%',
    gap: 15, // Note: gap works in recent React Native versions
  },
  card: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 2, // shadow for android
    shadowColor: '#000', // shadow for ios
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    marginBottom: 5, // backup if gap isn't supported
  },
  iconBg: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 13,
    color: '#6b7280',
  },
});

export default About;