import React from "react";
import ReactDOM from "react-dom/client";

import { Provider } from "react-redux";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import { store } from "./app/store";

import { muiTheme } from "./theme";

import App from "./App";

import "./index.css";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(

  <React.StrictMode>

    {/* Redux Store */}
    <Provider store={store}>

      {/* MUI Theme */}
      <ThemeProvider theme={muiTheme}>

        {/* Normalize CSS */}
        <CssBaseline />

        <App />

      </ThemeProvider>

    </Provider>

  </React.StrictMode>
);