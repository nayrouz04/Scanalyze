//on importe configureStore de RTK la fonction c la fonction qui crée le store Redux 
import { configureStore } from "@reduxjs/toolkit";
//l'instance RTK Query (api) qui contient tous les endpoints(login, upload, documents ....)  
import { api } from "../services/api";
//le reducer de l'authentification (gere user, token ..)
import authReducer from "../features/auth/authSlice";
//le conteneur de tout l'etat de l'app
export const store = configureStore({
  reducer: {
    auth: authReducer,
    [api.reducerPath]: api.reducer,
  },
  //pn ajoute le middleware de RTK Query
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});
//on exporte le type de tout l'etat global
export type RootState = ReturnType<typeof store.getState>;
//on exporte le type de la fonction dispatch
export type AppDispatch = typeof store.dispatch;