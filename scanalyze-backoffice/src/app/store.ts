// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi }     from '../services/api';
import authReducer     from '../features/auth/authSlice';
import { rtkQueryErrorLogger } from '../services/baseQueryWithReauth';

// ── Backoffice : importer adminApi pour l'enregistrer
import '../services/adminApi';
import '../services/documentsApi';
import '../services/authApi';

// ── Frontoffice : ajouter aussi
// import '../services/jobsApi';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware, rtkQueryErrorLogger),
});

setupListeners(store.dispatch);

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;