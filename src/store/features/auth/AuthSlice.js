import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { PURGE } from 'redux-persist';

const initialState = {
	user: null,
	error: null,
	loading: false,
};

export const login = createAsyncThunk(
	'auth/login',
	async (credentials, thunkAPI) => {
		const { email, password } = credentials;
		try {
			const response = await axios.post(
				`${import.meta.env.VITE_API_URL}/login`,
				{ email, password }
			);
			return response.data;
		} catch (error) {
			const errorMessage =
				error.response?.data?.message || 'Login failed';
			return thunkAPI.rejectWithValue(errorMessage);
		}
	}
);

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		logout: (state) => {
			state.user = null;
			state.status = 'idle';
			state.error = null;
			localStorage.clear();
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(login.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(login.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.user = action.payload;
				state.error = null;
			})
			.addCase(login.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload;
			})
			.addCase(PURGE, () => {
				return initialState;
			});

	},
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
