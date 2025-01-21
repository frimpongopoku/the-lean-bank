"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "./utils/firebaseConfig";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useAuth } from "./context/AuthContext";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { initUserCollection } from "./utils/firestore-utils";

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      // Get the authenticated user's unique ID
      const userId = result.user.uid;
      // Initialize Firestore collection for the user
      await initUserCollection(userId);
      router.push("/home");
    } catch (err) {
      setError("Failed to sign in. Please try again.");
      console.log("Login Error: ", err);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className=" flex flex-col items-center text-center">
        <p className="text-8xl font-bold text-green-600 mb-3">
          Pots & Balances
        </p>
        <h1 className="text-xl font-normal mb-4 text-gray-500">
          Sign in to your account
        </h1>
        {user ? (
          <button
            onClick={() => router.push("/home")}
            className="flex items-center hover:bg-green-800  gap-2 bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            {/* <FontAwesomeIcon icon={faGoogle} /> */}
            {user?.displayName} <FontAwesomeIcon icon={faAngleRight} />
          </button>
        ) : (
          <button
            onClick={handleGoogleSignIn}
            className="flex items-center hover:bg-red-600  gap-2 bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold"
          >
            {/* <FontAwesomeIcon icon={faGoogle} /> */}
            Google Auth
          </button>
        )}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
}
