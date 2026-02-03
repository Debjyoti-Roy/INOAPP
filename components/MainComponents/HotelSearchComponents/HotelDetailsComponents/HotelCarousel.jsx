import React, { useRef, useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Text,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import Svg, { Path } from "react-native-svg";
import Modal from "react-native-modal";
import ImageViewer from "react-native-image-zoom-viewer";

const { width, height } = Dimensions.get("window");

const HotelCarousel = ({ hotel }) => {
  const carouselRef = useRef(null);
  const [isGridVisible, setGridVisible] = useState(false);
  const [isZoomVisible, setZoomVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const images = hotel.imageUrls?.map((url) => ({ url })) || [];

  return (
    <View style={style3.container2}>
      {/* Main Carousel */}
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
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setGridVisible(true)}
          >
            <Image
              source={{ uri: item }}
              style={style3.image}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
      />

      {/* Arrow Buttons */}
      <TouchableOpacity
        onPress={() => carouselRef.current?.prev()}
        style={[style3.arrowButton, { left: 10 }]}
      >
        <Svg viewBox="0 0 24 24" width={28} height={28} fill="white">
          <Path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </Svg>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => carouselRef.current?.next()}
        style={[style3.arrowButton, { right: 10 }]}
      >
        <Svg viewBox="0 0 24 24" width={28} height={28} fill="white">
          <Path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z" />
        </Svg>
      </TouchableOpacity>

      {/* 📸 Grid Modal */}
      <Modal
        isVisible={isGridVisible}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        style={{ margin: 0 }}
      >
        <View style={style3.fullscreenContainer}>
          <TouchableOpacity
            style={style3.backButton}
            onPress={() => setGridVisible(false)}
          >
            <Text style={{ color: "white", fontSize: 18 }}>← Back</Text>
          </TouchableOpacity>

          <FlatList
            data={hotel.imageUrls}
            numColumns={2}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={style3.gridItem}
                onPress={() => {
                  setSelectedIndex(index);
                  setGridVisible(false);
                  setZoomVisible(true);
                }}
              >
                <Image source={{ uri: item }} style={style3.gridImage} />
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      {/* 🖼 Zoomable Gallery */}
      <Modal
        isVisible={isZoomVisible}
        style={{ margin: 0, backgroundColor: "black" }}
        onBackdropPress={() => setZoomVisible(false)}
      >
        <TouchableOpacity
          style={style3.backButton}
          onPress={() => setZoomVisible(false)}
        >
          <Text style={{ color: "white", fontSize: 18 }}>← Back</Text>
        </TouchableOpacity>
        <ImageViewer
          imageUrls={images}
          index={selectedIndex}
          enableSwipeDown
          onSwipeDown={() => setZoomVisible(false)}
        />
      </Modal>
    </View>
  );
};

export default HotelCarousel;

const style3 = {
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
  },
  arrowButton: {
    position: "absolute",
    top: "45%",
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 20,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: 60,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 20,
  },
  gridItem: {
    flex: 1,
    margin: 5,
  },
  gridImage: {
    width: "100%",
    height: height / 4,
    borderRadius: 10,
  },
};