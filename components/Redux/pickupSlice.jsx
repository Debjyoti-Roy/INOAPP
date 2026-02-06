import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "./api";
import * as SecureStore from "expo-secure-store";
// import api from "../api";

export const getPickupLocations = createAsyncThunk(
  "pickup/getPickupLocations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/v1/public/car-package-bookings/get-all-locations", {
        headers: {
          "ngrok-skip-browser-warning": "xyz", // optional if needed
        },
      });
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message || "Something went wrong");
    }
  }
);

export const getPickupRoutes = createAsyncThunk(
  "pickup/getPickupRoutes",
  async ({ pickuplocation, dropuplocation, numberofpeople }, { rejectWithValue }) => {
    try {
      const url = `/v1/public/car-package-bookings/get-pickup-route` +
        `?pickuplocation=${encodeURIComponent(pickuplocation)}` +
        `&dropuplocation=${encodeURIComponent(dropuplocation)}` +
        `&numberofpeople=${encodeURIComponent(numberofpeople)}`;

      console.log(url)
      const response = await api.get(url, {
        headers: {
          "ngrok-skip-browser-warning": "xyz",
        },
      });

      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message || "Something went wrong");
    }
  }
);

export const createPickupBooking = createAsyncThunk(
  "pickup/createPickupBooking",
  async (booking, { rejectWithValue }) => {
    try {
      const token = await SecureStore.getItemAsync("token");
      const formattedDate = new Date(booking.pickUpTime).toISOString().split('.')[0];
      const response = await api.post(
        `/v1/private/car-package-bookings/create-booking` +
        `?routeid=${encodeURIComponent(booking.routeid)}` +
        `&pickuplocation=${encodeURIComponent(booking.pickuplocation)}` +
        `&droplocation=${encodeURIComponent(booking.droplocation)}` +
        `&pickUpTime=${formattedDate}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "xyz",
          },
        }
      );
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message || "Something went wrong");
    }
  }
);


const initialState = {
  pickupLocations: [],
  pickupRoutes: [],

  loadingLocations: false,
  loadingRoutes: false,
  loadingBooking: false,

  errorLocations: null,
  errorRoutes: null,
  errorBooking: null,

  bookingData: null,
};

const pickupSlice = createSlice({
  name: "pickup",
  initialState,
  reducers: {
    clearPickupRoutes: (state) => {
      state.pickupRoutes = [];
      state.errorRoutes = null;
    },
    clearBooking: (state) => {
      state.bookingData = null;
      state.errorBooking = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ---------------- Pickup Locations ---------------- */
      .addCase(getPickupLocations.pending, (state) => {
        state.loadingLocations = true;
        state.errorLocations = null;
      })
      .addCase(getPickupLocations.fulfilled, (state, action) => {
        state.loadingLocations = false;
        state.pickupLocations = action.payload.data;
      })
      .addCase(getPickupLocations.rejected, (state, action) => {
        state.loadingLocations = false;
        state.errorLocations = action.payload || "Failed to fetch pickup locations";
      })

      /* ---------------- Pickup Routes ---------------- */
      .addCase(getPickupRoutes.pending, (state) => {
        state.loadingRoutes = true;
        state.errorRoutes = null;
      })
      .addCase(getPickupRoutes.fulfilled, (state, action) => {
        state.loadingRoutes = false;
        state.pickupRoutes = action.payload.data;
      })
      .addCase(getPickupRoutes.rejected, (state, action) => {
        state.loadingRoutes = false;
        state.errorRoutes = action.payload || "Failed to fetch pickup routes";
      })

      /* ---------------- Create Pickup Booking ---------------- */
      .addCase(createPickupBooking.pending, (state) => {
        state.loadingBooking = true;
        state.errorBooking = null;
        state.bookingData = null;
      })
      .addCase(createPickupBooking.fulfilled, (state, action) => {
        state.loadingBooking = false;
        state.bookingData = action.payload.data;
        state.errorBooking = null;
      })
      .addCase(createPickupBooking.rejected, (state, action) => {
        state.loadingBooking = false;
        state.errorBooking = action.payload || "Failed to create pickup booking";
        state.bookingData = null;
      });
  },
});

export const { clearPickupRoutes, clearBooking } = pickupSlice.actions;

export default pickupSlice.reducer;