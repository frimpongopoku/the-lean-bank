"use client";
// context/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../utils/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

const AuthContext = createContext();

export const UNDEFINED = "UNDEFINED";
export const AuthProvider = ({ children, previewUser }) => {
  const [user, setUser] = useState(previewUser || UNDEFINED);

  useEffect(() => {
    if (previewUser) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    if (previewUser) return;
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
