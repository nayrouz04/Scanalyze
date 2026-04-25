import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { store } from "./app/store";
import { muiTheme } from "./theme";
import App from "./App";          // ← App au lieu de AppRouter
import "./index.css";
import { setCredentials } from "./features/auth/authSlice";

store.dispatch(setCredentials({ name: "...", email: "...", role: "admin" }));

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <App />                   {/* ← App au lieu de AppRouter */}
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);