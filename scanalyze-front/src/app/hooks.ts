// src/app/hooks.ts
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "./store";
import { selectIsAuthenticated, selectRole } from "../features/auth/authSlice";
 
// Typed dispatch — supporte les thunks et les mutations RTK Query
export const useAppDispatch: () => AppDispatch = useDispatch;
 
// Typed selector — autocomplétion complète sur RootState
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
 
// Hook raccourci — accès rapide à l'état d'authentification
export const useAuth = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const role            = useAppSelector(selectRole);
  return { isAuthenticated, role, isAdmin: role === "admin" };
};