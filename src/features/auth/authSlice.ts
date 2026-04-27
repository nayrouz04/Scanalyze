// importe createSlice la fonction RTK qui cée un slice Redux (une partie de store avec ses reducers et actions )
import { createSlice } from "@reduxjs/toolkit";
//importe le type PayloadAction , utilisé pour typer les données reçue par un reducer
import type { PayloadAction } from "@reduxjs/toolkit";

//les interfaces TypeScript
interface User {
  name: string;
  email: string;
  role: "admin" | "user";
}

//definit la structure de l'tat auth dans le store 
interface AuthState {
  user: User | null;   //l'utilisateur connecté ou null si déconnecté 
  token: string | null; //le token JWT ou null su déconnecté
  isAuthenticated: boolean;  //true si connecté, false sinon
}

//l'etat au demarrage de l'app , personn n'est connecté , pas de token
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

//creation du slice : utilisé par Redux pour idntifier les actions 
const authSlice = createSlice({
  name: "auth",
  initialState,
  //les reducers 
  reducers: {
    //appelé apres un login reussi
    setCredentials(
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    //appelé quand l'utilisateur se déconnecte , remet tous à null / false 
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});
//exporte les actions générées automatiquement par RTK 
export const { setCredentials, logout } = authSlice.actions;
//exporte le reducer 
export default authSlice.reducer;