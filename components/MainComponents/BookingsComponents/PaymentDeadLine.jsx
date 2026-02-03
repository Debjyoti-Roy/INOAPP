import React, { useEffect, useState } from "react";
import { Text, StyleSheet } from "react-native";

const PaymentDeadline = ({ expiredAt }) => {

  const calculateTimeLeft = () => {
    const difference = new Date(expiredAt) - new Date();

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return null;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [expiredAt]);

  if (!timeLeft) {
    return (
      <Text style={styles.expiredText}>
        ⚠️ The payment deadline has passed.
      </Text>
    );
  }

  return (
    <Text style={styles.timerText}>
      Kindly complete your payment within:{" "}
      {timeLeft.days > 0 && `${timeLeft.days}d `}
      {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
    </Text>
  );
};

const styles = StyleSheet.create({
  expiredText: {
    color: "#991b1b", // red-800
    fontWeight: "bold",
  },
  timerText: {
    color: "#991b1b", // red-800
    fontWeight: "bold",
  }
});

export default PaymentDeadline;
