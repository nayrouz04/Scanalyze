// configureStore — RTK function that creates the Redux store
import { configureStore } from "@reduxjs/toolkit";

// RTK Query API slice — contains all endpoints (documents, users, etc.)
import { api } from "@services";

// Auth reducer — manages user session, token, and authentication state
import authReducer from "@features/auth/authSlice";

// Create and configure the Redux store
export const store = configureStore({
  reducer: {
    // Authentication state slice
    auth: authReducer,

    // RTK Query cache state — keyed by the API's reducerPath
    [api.reducerPath]: api.reducer,
  },

  // Append RTK Query middleware for caching, invalidation, and polling
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

// RootState — full type of the Redux state tree
export type RootState = ReturnType<typeof store.getState>;

// AppDispatch — type of the store's dispatch function
export type AppDispatch = typeof store.dispatch;