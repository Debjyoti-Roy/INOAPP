import React from "react";
import { TouchableOpacity, Share } from "react-native";
import { Feather } from "@expo/vector-icons";

const HotelShareButton = ({ url, message }) => {
  const onShare = async () => {
    try {
      await Share.share({
        message: `${message}\n${url}`,
      });
    } catch (error) {
      console.log("Share error:", error);
    }
  };

  return (
    <TouchableOpacity
      onPress={onShare}
      style={{
        position: "absolute",
        bottom: 24,
        right: 24,
        backgroundColor: "rgba(0,0,0,0.5)",
        padding: 14,
        borderRadius: 50,
      }}
    >
      <Feather name="share-2" size={22} color="white" />
    </TouchableOpacity>
  );
};

export default HotelShareButton;
