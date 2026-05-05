import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import { store }      from "./app/store";
import { muiTheme }   from "./theme";                        // ← via theme/index.ts
import App            from "./App";
import "./index.css";

import { setCredentials } from "./features/auth/authSlice";

// Temporary: seed Redux with a mock admin session for development
store.dispatch(setCredentials({ name: "...", email: "...", role: "admin" }));

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* Redux store provider — makes the store available to all components */}
    <Provider store={store}>
      {/* MUI theme provider — applies the dark theme globally */}
      <ThemeProvider theme={muiTheme}>
        {/* CssBaseline — normalizes browser default styles */}
        <CssBaseline />
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);