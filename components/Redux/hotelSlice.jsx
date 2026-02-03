import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "./api";

export const createHotel = createAsyncThunk(
  "hotel/createHotel",
  async ({ token, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "/v1/partner/createhotel",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      //   return response.data;
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addRooms = createAsyncThunk(
  "hotel/addRooms",
  async ({ token, roomsData, partnerId }, { rejectWithValue }) => {
    try {
      const id = partnerId
      const response = await api.post(
        `/v1/partner/${id}/rooms`,
        roomsData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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

export const getHotels = createAsyncThunk(
  "hotel/getHotels",
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await api.get("/v1/partner/gethotels", {
        headers: {
          Authorization: `Bearer ${token}`,
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

export const getRoomsByPartner = createAsyncThunk(
  "hotel/getRoomsByPartner",
  async ({ partnerId, token }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/v1/partner/${partnerId}/rooms`, {
        headers: {
          Authorization: `Bearer ${token}`,
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

export const getLocations = createAsyncThunk(
  "hotel/getLocations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/v1/public/get-location", {
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

export const searchHotels = createAsyncThunk(
  "hotel/searchHotels",
  async ({ location, checkIn, checkOut, requiredRoomCount, page, size, minPrice, maxPrice, tags, amenities }, { rejectWithValue }) => {
    try {
      // Build params object with required parameters
      const params = {
        location,
        checkIn,
        checkOut,
        requiredRoomCount,
        page,
        size,
      };

      // Add optional filter parameters only if they have valid values
      if (minPrice !== null && minPrice !== undefined && minPrice !== "" && minPrice !== 0) {
        params.minPrice = minPrice;
      }

      if (maxPrice !== null && maxPrice !== undefined && maxPrice !== "" && maxPrice !== 0) {
        params.maxPrice = maxPrice;
      }

      if (tags && Array.isArray(tags) && tags.length > 0) {
        params.tags = tags.join(',');
      }

      if (amenities && Array.isArray(amenities) && amenities.length > 0) {
        params.amenities = amenities.join(',');
      }

      const response = await api.get("/v1/public/search-hotel", {
        params,
        headers: {
          "ngrok-skip-browser-warning": "xyz", // optional if needed
        },
      });

      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message || "Something went wrong");
    }
  }
);

export const fetchHotel = createAsyncThunk(
  "hotel/fetchHotel",
  async ({ checkIn, checkOut, id }, thunkAPI) => {
    try {
      const response = await api.get(`/v1/public/${id}/get-hotel`, {
        params: {
          checkIn,
          checkOut,
        },
        headers: {
          "ngrok-skip-browser-warning": "xyz", // optional if needed
        },
      });
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const bookRooms = createAsyncThunk(
  "hotel/bookRooms",
  async ({ hotelId, roomBookings, token }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/v1/private/${hotelId}/book-rooms`,
        {
          roomBookings: roomBookings,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      console.error(error);
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

export const cancelBooking = createAsyncThunk(
  "booking/cancelBooking",
  async ({ token, bookingGroupCode, cancelReason }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "/v1/private/hotel/cancel",
        {
          bookingGroupCode,
          cancelReason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Cancel failed" });
    }
  }
);

export const getRefundStatus = createAsyncThunk(
  "hotel/getRefundStatus",
  async ({ token, bookingGroupCode }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/v1/private/hotel/${bookingGroupCode}/refund-status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "xyz",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Refund status fetch failed");
    }
  }
);

export const updateHotelDetails = createAsyncThunk(
  "hotel/updateHotelDetails",
  async ({ hotelId, payload, token }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/v1/partner/${hotelId}/updatehotel`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Update failed");
    }
  }
);

export const updateRoomFeatures = createAsyncThunk(
  "rooms/updateRoomFeatures",
  async ({ id, features, token }, thunkAPI) => {
    try {
      console.log("update room features", id, features)
      const response = await api.patch(`/v1/partner/${id}/rooms`, features, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);



const hotelSlice = createSlice({
  name: "hotel",
  initialState: {
    hotelData: null,
    loading: false,
    error: null,
    rooms: [],
    locations: [],
    searchResults: [],
    hotelData: null,
    bookingResponse: null,
    bookingLoading: false,
    bookingError: null,
    cancelBookingResponse: null,
    cancelBookingLoading: false,
    cancelBookingError: null,
    refundStatus: null,
    refundLoading: false,
    refundError: null,
    hotelInfo: null,
    success: false,
    updateLoading: false,
    updateError: null,
    updateResult: null,

  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createHotel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createHotel.fulfilled, (state, action) => {
        state.loading = false;
        state.hotelData = action.payload;
      })
      .addCase(createHotel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addRooms.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(addRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.rooms = action.payload;
      })
      .addCase(addRooms.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })
      .addCase(getHotels.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(getHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.hotels = action.payload;
      })
      .addCase(getHotels.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })
      .addCase(getRoomsByPartner.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(getRoomsByPartner.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.rooms = action.payload; // stores in rooms array
      })
      .addCase(getRoomsByPartner.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })
      .addCase(getLocations.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(getLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.locations = action.payload;
      })
      .addCase(getLocations.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })
      .addCase(searchHotels.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(searchHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.searchResults = action.payload;
      })
      .addCase(searchHotels.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })
      .addCase(fetchHotel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotel.fulfilled, (state, action) => {
        state.loading = false;
        state.hotelData = action.payload;
      })
      .addCase(fetchHotel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(bookRooms.pending, (state) => {
        state.bookingLoading = true;
        state.bookingError = null;
      })
      .addCase(bookRooms.fulfilled, (state, action) => {
        state.bookingLoading = false;
        state.bookingResponse = action.payload;
      })
      .addCase(bookRooms.rejected, (state, action) => {
        state.bookingLoading = false;
        state.bookingError = action.payload;
      })
      .addCase(cancelBooking.pending, (state) => {
        state.cancelBookingLoading = true;
        state.cancelBookingError = null;
        state.cancelBookingResponse = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.cancelBookingLoading = false;
        state.cancelBookingResponse = action.payload;
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.cancelBookingLoading = false;
        state.cancelBookingError = action.payload;
      })
      .addCase(getRefundStatus.pending, (state) => {
        state.refundLoading = true;
        state.refundError = null;
        state.refundStatus = null;
      })
      .addCase(getRefundStatus.fulfilled, (state, action) => {
        state.refundLoading = false;
        state.refundStatus = action.payload;
      })
      .addCase(getRefundStatus.rejected, (state, action) => {
        state.refundLoading = false;
        state.refundError = action.payload;
      })
      .addCase(updateHotelDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateHotelDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.hotelInfo = action.payload;
        state.success = true;
      })
      .addCase(updateHotelDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Update failed";
        state.success = false;
      })
    builder
      .addCase(updateRoomFeatures.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateRoomFeatures.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateResult = action.payload;
      })
      .addCase(updateRoomFeatures.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      });
  },
});

export default hotelSlice.reducer;