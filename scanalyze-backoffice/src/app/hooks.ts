// src/app/hooks.ts
// Typed Redux hooks — use these instead of plain useDispatch / useSelector.
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "./store";
import { selectIsAuthenticated, selectRole } from "../features/auth/authSlice";

// useAppDispatch — typed dispatch, supports thunks and RTK Query mutations
export const useAppDispatch: () => AppDispatch = useDispatch;

// useAppSelector — typed selector with full RootState autocomplete
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// useAuth — accès rapide à l'état auth dans n'importe quel composant
export const useAuth = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const role            = useAppSelector(selectRole);
  return { isAuthenticated, role, isAdmin: role === "admin" };
};