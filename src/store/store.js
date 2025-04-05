import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import {
	persistStore,
	persistReducer,
	FLUSH,
	REHYDRATE,
	PAUSE,
	PERSIST, 
	REGISTER,
} from 'redux-persist';
import localForage from 'localforage';
import authReducer from '@/store/features/auth/AuthSlice.js'
import purgeMiddleware from './persistMiddleware';
// Configure persist
const persistConfig = {
	key: 'root',
	storage: localForage,
};

const rootReducer = combineReducers({
	auth: authReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
	  getDefaultMiddleware({
		serializableCheck: false,
	  }).concat(purgeMiddleware),
  });

export const persistor = persistStore(store);

export const purgePersistedState = async () => {
    await persistor.purge();
    await persistor.flush();
};