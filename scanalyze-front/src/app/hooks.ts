// Typed Redux hooks — use these instead of plain useDispatch / useSelector.
// Pre-typed with RootState and AppDispatch so no manual typing is needed in components.
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "./store";

// useAppDispatch — typed dispatch, supports thunks and RTK Query mutations
export const useAppDispatch: () => AppDispatch = useDispatch;

// useAppSelector — typed selector with full RootState autocomplete
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;