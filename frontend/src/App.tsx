import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { dlsTheme } from "./dls/theme";
import { AuthProvider, CartProvider } from "./contexts";
import { AppRouter } from "router/AppRouter";

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <ThemeProvider theme={dlsTheme}>
          <CssBaseline />
          <Router>
            <AppRouter />
          </Router>
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
