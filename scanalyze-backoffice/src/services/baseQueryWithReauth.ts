// src/services/baseQueryWithReauth.ts
import { isRejectedWithValue } from '@reduxjs/toolkit';
import type { MiddlewareAPI, Middleware } from '@reduxjs/toolkit';
import { logout } from '../features/auth/authSlice';

/**
 * Log a warning and, if the status code is 401, log out the user
 */
export const rtkQueryErrorLogger: Middleware = (api: MiddlewareAPI) => (next) => (action) => {
  // RTK Query uses `serializableStateInvariantMiddleware` to check if the action is serializable
  // The built-in action creators from RTK Query are serializable, but we should check
  if (isRejectedWithValue(action)) {
    // Check if it's a 401 Unauthorized error
    if (action.payload?.status === 401) {
      console.warn('🔓 Session expired (401 Unauthorized). Logging out...');
      api.dispatch(logout());
      // Redirect to login
      window.location.href = '/login';
    }
  }

  return next(action);
};

