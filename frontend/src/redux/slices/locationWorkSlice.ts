import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchLocationWorks = createAsyncThunk(
  'locationWork/fetchLocationWorksStatus',
  async () => {
    const { data } = await axios.get('http://localhost:3000/location-work');
    return data as any[];
  }
);

export const fetchLocationWorksWithStats = createAsyncThunk(
  'locationWork/fetchLocationWorksWithStatsStatus',
  async () => {
    const { data } = await axios.get('http://localhost:3000/location-work/stats');
    return data as any[];
  }
);

export const fetchPopularLocations = createAsyncThunk(
  'locationWork/fetchPopularLocationsStatus',
  async (limit: number = 10) => {
    const { data } = await axios.get(`http://localhost:3000/location-work/popular?limit=${limit}`);
    return data as any[];
  }
);

export const searchLocationWorks = createAsyncThunk(
  'locationWork/searchLocationWorksStatus',
  async (name: string) => {
    const { data } = await axios.get(`http://localhost:3000/location-work/search/${name}`);
    return data as any[];
  }
);

export const createLocationWork = createAsyncThunk(
  'locationWork/createLocationWorkStatus',
  async (locationName: string) => {
    const { data } = await axios.post('http://localhost:3000/location-work', {
      locationName
    });
    return data;
  }
);

export const updateLocationWork = createAsyncThunk(
  'locationWork/updateLocationWorkStatus',
  async ({ id, locationName }: { id: number; locationName: string }) => {
    const { data } = await axios.put(`http://localhost:3000/location-work/${id}`, {
      locationName
    });
    return data;
  }
);

export const deleteLocationWork = createAsyncThunk(
  'locationWork/deleteLocationWorkStatus',
  async (id: number) => {
    await axios.delete(`http://localhost:3000/location-work/${id}`);
    return id;
  }
);

interface LocationWorkState {
  locationWorks: any[];
  locationWorksWithStats: any[];
  popularLocations: any[];
  searchResults: any[];
  status: 'idle' | 'loading' | 'error';
  error: string | null;
}

const initialState: LocationWorkState = {
  locationWorks: [],
  locationWorksWithStats: [],
  popularLocations: [],
  searchResults: [],
  status: 'idle',
  error: null,
};

const locationWorkSlice = createSlice({
  name: 'locationWork',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocationWorks.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchLocationWorks.fulfilled, (state, action) => {
        state.locationWorks = action.payload;
        state.status = 'idle';
      })
      .addCase(fetchLocationWorks.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message || 'Failed to fetch locations';
      })
      .addCase(fetchLocationWorksWithStats.fulfilled, (state, action) => {
        state.locationWorksWithStats = action.payload;
      })
      .addCase(fetchPopularLocations.fulfilled, (state, action) => {
        state.popularLocations = action.payload;
      })
      .addCase(searchLocationWorks.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })
      .addCase(createLocationWork.fulfilled, (state, action) => {
        state.locationWorks.push(action.payload);
      })
      .addCase(updateLocationWork.fulfilled, (state, action) => {
        const index = state.locationWorks.findIndex(
          loc => loc.locationId === (action.payload as any).locationId
        );
        if (index !== -1) {
          state.locationWorks[index] = action.payload;
        }
      })
      .addCase(deleteLocationWork.fulfilled, (state, action) => {
        state.locationWorks = state.locationWorks.filter(
          loc => loc.locationId !== action.payload
        );
      });
  },
});

export const { clearSearchResults } = locationWorkSlice.actions;
export default locationWorkSlice.reducer;