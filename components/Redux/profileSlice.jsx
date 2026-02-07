// src/redux/slices/profileSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { api2 } from "./api";
import * as SecureStore from "expo-secure-store";

// ----------------- Upload profile image -----------------
export const uploadProfileImage = createAsyncThunk(
  "profile/uploadProfileImage",
  async ({ file, token }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      console.log("profileSlice 14")

      const headers = {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      };

      const response = await api2.patch("/v1/private/updateprofile/image", formData, { headers });

      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ----------------- Upload profile details -----------------
export const uploadProfileDetails = createAsyncThunk(
  "profile/uploadProfileDetails",
  async ({ data, token }, { rejectWithValue }) => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await api.patch("/v1/private/updateprofile", data, { headers });

      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ----------------- Get queries for user -----------------
export const fetchUserQueries = createAsyncThunk(
  "profile/fetchUserQueries",
  async ({ token, page = 0, size = 5, status = "OPEN" }, { rejectWithValue }) => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "xyz",
      };

      let url = `/v1/private/get-queries-for-user?page=${page}&size=${size}`;

      // If status !== ALL, append status
      if (status !== "ALL") {
        url += `&status=${status}`;
      }

      // Use api or api2 depending on your setup
      const response = await api.get(url, { headers });

      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ----------------- Fetch user bookings -----------------
export const fetchUserBookings = createAsyncThunk(
  "profile/fetchUserBookings",
  async ({ token, page, size, status }, { rejectWithValue }) => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true", // optional if ngrok is blocking
      };

      let url=`/v1/private/get-bookings?page=${page}&size=${size}`

      if (status !== "ALL") {
        url += `&statuses=${status}`;
      }

      const response = await api.get(url, { headers });

      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
// ----------------- Fetch user car package bookings -----------------
export const fetchUserCarPackageBookings = createAsyncThunk(
  "profile/fetchUserCarPackageBookings",
  async ({ token, page, size, status }, { rejectWithValue }) => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true", // optional if ngrok is blocking
      };

      let url=`/v1/private/car-package-booking/get-all?page=${page}&size=${size}`

      if (status !== "ALL") {
        url += `&statuses=${status}`;
      }

      const response = await api.get(url, { headers });

      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ----------------- Fetch user tour package bookings -----------------
export const fetchUserTourPackageBookings = createAsyncThunk(
  "profile/fetchUserTourPackageBookings",
  async ({ page, size, status, token }, { rejectWithValue }) => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true", // optional if ngrok is blocking
      };

      let url=`/v1/private/tour-booking/get-query?page=${page}&size=${size}&queryStatus=${status}`

      const response = await api.get(url, { headers });

      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getLatestCarPickupBooking = createAsyncThunk(
  "profile/getLatestBooking",
  async (_, { rejectWithValue }) => {
    try {
      const token = await SecureStore.getItemAsync("token");

      const response = await api.get(
        "/v1/private/car-package-bookings/get-latest-booking",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "xyz",
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Get all cars failed" }
      );
    }
  }
);
export const getAllCarPickupBookings = createAsyncThunk(
  "profile/getAllCarPickupBookings",
  async (_, { rejectWithValue }) => {
    try {
      const token = await SecureStore.getItemAsync("token");
      const response = await api.get(
        "/v1/private/car-package-bookings/get-all-bookings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "xyz",
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Get all cars failed" }
      );
    }
  }
);
export const cancelCarPickupBookings = createAsyncThunk(
  "profile/cancelCarPickupBookings ",
  async ({ bookingId }, { rejectWithValue }) => {
    try {
      const token = await SecureStore.getItemAsync("token");

      const response = await api.patch(
        "/v1/private/car-package-bookings/customer-cancel-booking",
        {},
        {
          params: { bookingId },
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "xyz",
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Get all cars failed" }
      );
    }
  }
);


// ----------------- Slice -----------------
const profileSlice = createSlice({
  name: "profile",
  initialState: {
    data: null,
    loading: false,
    error: null,
    queries: [], // <- new state for queries
    queriesLoading: false,
    queriesError: null,
    bookings: [], // <== Add this
    bookingsLoading: false,
    bookingsError: null,
    carPackagebookings: {}, // <== Add this
    carPackagebookingsLoading: false,
    carPackagebookingsError: null,
    carPackagebookingsStatus: null,
     // ✅ New state for tour package bookings
    tourPackageBookings: [],
    tourPackageBookingsLoading: false,
    tourPackageBookingsError: null,
    tourPackageBookingsStatus: null,

     // ✅ latest car pickup booking
    latestCarPickupBooking: null,
    latestCarPickupBookingLoading: false,
    latestCarPickupBookingError: null,

    // ✅ all car pickup bookings
    allCarPickupBookclings: [],
    allCarPickupBookingsLoading: false,
    allCarPickupBookingsError: null,

    // cancel car pickup booking (customer)
    cancelCarPickupBookingLoading: false,
    cancelCarPickupBookingError: null,
    cancelCarPickupBookingSuccess: false,
  },
  reducers: {
    resetCancel: (state) => {
      state.cancelCarPickupBookingSuccess = false;
      state.cancelCarPickupBookingError = null;
      state.cancelCarPickupBookingLoading = false
    }
  },
  extraReducers: (builder) => {
    // Upload Image
    builder
      .addCase(uploadProfileImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(uploadProfileImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Upload Details
    builder
      .addCase(uploadProfileDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProfileDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(uploadProfileDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch User Queries
    builder
      .addCase(fetchUserQueries.pending, (state) => {
        state.queriesLoading = true;
        state.queriesError = null;
      })
      .addCase(fetchUserQueries.fulfilled, (state, action) => {
        state.queriesLoading = false;
        state.queries = action.payload.data;
      })
      .addCase(fetchUserQueries.rejected, (state, action) => {
        state.queriesLoading = false;
        state.queriesError = action.payload;
      });

    // Fetch User Bookings
    builder
      .addCase(fetchUserBookings.pending, (state) => {
        state.bookingsLoading = true;
        state.bookingsError = null;
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.bookingsLoading = false;
        state.bookings = action.payload.data;
      })
      .addCase(fetchUserBookings.rejected, (state, action) => {
        state.bookingsLoading = false;
        state.bookingsError = action.payload;
      });
      // Fetch User Car Package Bookings
    builder
      .addCase(fetchUserCarPackageBookings.pending, (state) => {
        state.carPackagebookingsLoading = true;
        state.carPackagebookingsError = null;
      })
      .addCase(fetchUserCarPackageBookings.fulfilled, (state, action) => {
        state.carPackagebookingsLoading = false;
        state.carPackagebookings = action.payload.data;
        state.carPackagebookingsStatus=action.payload.status;
      })
      .addCase(fetchUserCarPackageBookings.rejected, (state, action) => {
        state.carPackagebookingsLoading = false;
        state.carPackagebookingsError = action.payload;
      });

      // --- ✅ Fetch User Tour Package Bookings ---
    builder
      .addCase(fetchUserTourPackageBookings.pending, (state) => {
        state.tourPackageBookingsLoading = true;
        state.tourPackageBookingsError = null;
      })
      .addCase(fetchUserTourPackageBookings.fulfilled, (state, action) => {
        state.tourPackageBookingsLoading = false;
        state.tourPackageBookings = action.payload.data;
        state.tourPackageBookingsStatus = action.payload.status;
      })
      .addCase(fetchUserTourPackageBookings.rejected, (state, action) => {
        state.tourPackageBookingsLoading = false;
        state.tourPackageBookingsError = action.payload;
      });
      // ---------------- ✅ Latest Car Pickup Booking ----------------
      builder
      .addCase(getLatestCarPickupBooking.pending, (state) => {
        state.latestCarPickupBookingLoading = true;
        state.latestCarPickupBookingError = null;
      })
      .addCase(getLatestCarPickupBooking.fulfilled, (state, action) => {
        state.latestCarPickupBookingLoading = false;
        state.latestCarPickupBooking = action.payload;
      })
      .addCase(getLatestCarPickupBooking.rejected, (state, action) => {
        state.latestCarPickupBookingLoading = false;
        state.latestCarPickupBookingError = action.payload;
      });

    // ---------------- ✅ All Car Pickup Bookings ----------------
    builder
      .addCase(getAllCarPickupBookings.pending, (state) => {
        state.allCarPickupBookingsLoading = true;
        state.allCarPickupBookingsError = null;
      })
      .addCase(getAllCarPickupBookings.fulfilled, (state, action) => {
        state.allCarPickupBookingsLoading = false;
        state.allCarPickupBookings = action.payload;
      })
      .addCase(getAllCarPickupBookings.rejected, (state, action) => {
        state.allCarPickupBookingsLoading = false;
        state.allCarPickupBookingsError = action.payload;
      });

    // ---------------- ✅ Cancel Car Pickup Booking ----------------
    builder
      .addCase(cancelCarPickupBookings.pending, (state) => {
        state.cancelCarPickupBookingLoading = true;
        state.cancelCarPickupBookingError = null;
        state.cancelCarPickupBookingSuccess = false;
      })
      .addCase(cancelCarPickupBookings.fulfilled, (state) => {
        state.cancelCarPickupBookingLoading = false;
        state.cancelCarPickupBookingSuccess = true;
      })
      .addCase(cancelCarPickupBookings.rejected, (state, action) => {
        state.cancelCarPickupBookingLoading = false;
        state.cancelCarPickupBookingError =
          action.payload?.message || "Cancel booking failed";
      });

  },
});

export const { resetCancel } = profileSlice.actions;

export default profileSlice.reducer;