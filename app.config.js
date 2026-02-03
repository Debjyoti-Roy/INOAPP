// app.config.js
import "dotenv/config";

export default ({ config }) => ({
  ...config,
  expo: {
    name: "ino",
    slug: "ino",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "ino",
    userInterfaceStyle: "automatic",
    newArchEnabled: false,
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      googleServicesFile: "./GoogleService-Info.plist",
      config: {
        googleMapsApiKey: process.env.GMAP_APIKEY
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      package: "com.debjyotiroy.ino",
      googleServicesFile: "./google-services.json",
       config: {
        googleMaps: {
          apiKey: process.env.GMAP_APIKEY
        }
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      // "expo-router",
      "@react-native-firebase/app",
      "expo-secure-store",
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "7f526cb1-d264-4cd2-8d87-81f129ae50c0",
      },
      // 👇 Example of using .env variable
      apiUrl: process.env.API_PUBLICDOMAIN,
      razorpaykey: process.env.RAZORPAY_KEY,
    },
  },
});
