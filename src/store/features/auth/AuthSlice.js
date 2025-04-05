import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { PURGE } from 'redux-persist';

const initialState = {
    user: null,               
    tempUser: null,           
    error: null,
    loading: false,
    requires2FA: false,       
    status: 'idle',          
};

// Login action
export const login = createAsyncThunk(
    'auth/login',
    async (credentials, thunkAPI) => {
        const { email, password } = credentials;
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/login`,
                { email, password }
            );

			  // Check if 2FA is required
			if (response.data.two_factor) {
                return thunkAPI.fulfillWithValue({
                    requires2FA: true,
                });
            }

			
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Login failed';
            return thunkAPI.rejectWithValue(errorMessage);
        }
    }
);

// Verify Two-Factor Authentication action
export const verifyTwoFactor = createAsyncThunk(
    'auth/verifyTwoFactor',
    async (creds, thunkAPI) => {
		const { code, email } = creds;
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/two-factor-challenge`,
                { code, email }
            );
            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || '2FA verification failed';
            return thunkAPI.rejectWithValue(errorMessage);
        }
    }
);

// export const updateUserProfile = createAsyncThunk(
//     'auth/updateUserProfile',
//     async (userId, formdata, thunkAPI) => {
// 		console.log('redx', userId, formdata)
//         try {
//             const response = await axios.post(
//                 `${import.meta.env.VITE_API_URL}/companies/employee/${data}/update`,
//                 formData,
//                 {
//                     headers: {
//                         'Content-Type': 'multipart/form-data',
//                     },
//                 }
//             );
//             return response.data;
//         } catch (error) {
//             const errorMessage =
//                 error.response?.data?.message || 'Failed to update profile';
//             return thunkAPI.rejectWithValue(errorMessage);
//         }
//     }
// );

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
        updateUserProfile: (state, action) => { 
            state.user = { ...state.user, ...action.payload };
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(login.fulfilled, (state, action) => {
                if (action.payload.requires2FA) {
                    state.requires2FA = true;  
                    state.tempUser = { email: action.meta.arg.email };  
                } else {
                    state.status = 'succeeded';
                    state.user = action.payload; 
                    state.error = null;
                }
            })
            .addCase(login.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
			// Verify Two-Factor Authentication
            .addCase(verifyTwoFactor.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(verifyTwoFactor.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload; 
                state.tempUser = null;  
                state.requires2FA = false;  
                state.error = null;
            })
            .addCase(verifyTwoFactor.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;  
            })
            .addCase(PURGE, () => {
                return initialState;
            });
    },
});

export const { logout, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;
