import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import CartProvider from "./components/CartProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId="969633748058-b4gs7t8avu5n0qured3dn28p3orl7r69.apps.googleusercontent.com">
    <BrowserRouter>
      <CartProvider>
    <App />
  </CartProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
);


