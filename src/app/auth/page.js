import React from "react";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./LoginPage";
import AuthGuard from "./AuthGuard";

function Auth() {
  return (
    <AuthProvider>
      <AuthGuard>
        <LoginPage />
      </AuthGuard>
    </AuthProvider>
  );
}

export default Auth;
