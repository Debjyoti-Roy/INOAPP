import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { api3 } from "./api";

export const getTourPackages = createAsyncThunk(
    "public/get-packages",
    async ({ area, month, duration, tourTypes }, { rejectWithValue }) => {
        try {
            // base mandatory params
            const params = {
                area,
                //   duration,
                month,
            };

            // only add carTypes if length > 0
            if (Array.isArray(tourTypes) && tourTypes.length > 0) {
                params.tourTypes = tourTypes.map((type) =>
                    type.replace(/\s+/g, "_")
                );
            }
            const d = Number(duration);
            if (!isNaN(d) && d >= 1) {
                params.duration = d;
            }

            const response = await api3.get(`/v1/public/tour-package/search`, {
                params,
                headers: {
                    "ngrok-skip-browser-warning": "xyz",
                },
            });

            return {
                data: response.data,
                status: response.status,
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data || "Packages fetch failed"
            );
        }
    }
);

export const getTourDetails = createAsyncThunk(
    "public/getTourPackage",
    async ({ id }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/v1/public/tour-package/get/${id}`, {
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

export const sendPublicEnquire = createAsyncThunk(
    "public/sendPublicEnquire",
    async ({ body }, { rejectWithValue }) => {
      try {
        const response = await api.post("/v1/public/tour-booking/create-query", body, {
          headers: {
            "Content-Type": "application/json",
          },
        });
  
        return {
          data: response.data,
          status: response.status,
        };
      } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
      }
    }
  );
  export const sendPrivateEnquire = createAsyncThunk(
    "public/sendPrivateEnquire",
    async ({ token, body }, { rejectWithValue }) => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };
  
        const response = await api.post("/v1/private/tour-booking/create-query", body, { headers });
  
        return {
          data: response.data,
          status: response.status,
        };
      } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
      }
    }
  );

  const initialState = {
    packages: [],
    loading: false,
    error: null,
  
    // details
    tourDetails: null,
    tourDetailsLoading: false,
    tourDetailsError: null,
    tourDetailsStatus: null,
  
    // enquiries
    publicEnquireLoading: false,
    publicEnquireError: null,
    publicEnquireStatus: null,
  
    privateEnquireLoading: false,
    privateEnquireError: null,
    privateEnquireStatus: null,
  };
  
  const tourPackageSlice = createSlice({
    name: "packages",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      builder
        // getPackages
        .addCase(getTourPackages.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(getTourPackages.fulfilled, (state, action) => {
          state.loading = false;
          state.packages = action.payload.data || [];
        })
        .addCase(getTourPackages.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || "Failed to fetch packages";
        })
  
        // getTourDetails
        .addCase(getTourDetails.pending, (state) => {
          state.tourDetailsLoading = true;
          state.tourDetailsError = null;
          state.tourDetailsStatus = null;
        })
        .addCase(getTourDetails.fulfilled, (state, action) => {
          state.tourDetailsLoading = false;
          state.tourDetails = action.payload.data || null;
          state.tourDetailsStatus = action.payload.status;
        })
        .addCase(getTourDetails.rejected, (state, action) => {
          state.tourDetailsLoading = false;
          state.tourDetailsError = action.payload || "Failed to fetch tour details";
        })
  
        // sendPublicEnquire
        .addCase(sendPublicEnquire.pending, (state) => {
          state.publicEnquireLoading = true;
          state.publicEnquireError = null;
          state.publicEnquireStatus = null;
        })
        .addCase(sendPublicEnquire.fulfilled, (state, action) => {
          state.publicEnquireLoading = false;
          state.publicEnquireStatus = action.payload.status;
        })
        .addCase(sendPublicEnquire.rejected, (state, action) => {
          state.publicEnquireLoading = false;
          state.publicEnquireError = action.payload || "Failed to send public enquiry";
        })
  
        // sendPrivateEnquire
        .addCase(sendPrivateEnquire.pending, (state) => {
          state.privateEnquireLoading = true;
          state.privateEnquireError = null;
          state.privateEnquireStatus = null;
        })
        .addCase(sendPrivateEnquire.fulfilled, (state, action) => {
          state.privateEnquireLoading = false;
          state.privateEnquireStatus = action.payload.status;
        })
        .addCase(sendPrivateEnquire.rejected, (state, action) => {
          state.privateEnquireLoading = false;
          state.privateEnquireError = action.payload || "Failed to send private enquiry";
        });
    },
  });
  
  export default tourPackageSlice.reducer;