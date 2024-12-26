import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import App from "./App"; // Assuming App is the main component
import { AuthProvider } from "./User/AuthContext"; // Update with the correct path

ReactDOM.render(
  <BrowserRouter>
    <AuthProvider> {/* Only wrap the App here */}
      <App />
    </AuthProvider>
  </BrowserRouter>,
  document.getElementById("root")
);
