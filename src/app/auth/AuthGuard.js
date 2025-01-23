// components/AuthGuard.js

"use client";
import { UNDEFINED, useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "../components/Loading";

const AuthGuard = ({ children, signout = false }) => {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/auth");
    }
  }, [user, router]);

  if (user === UNDEFINED) {
    return <Loading full />;
  }

  return (
    <>
      {children}{" "}
      {signout && (
        <button
          onClick={() => logout()}
          className="fixed font-bold hover:underline text-red-600 bottom-2 right-5"
        >
          Sign Out
        </button>
      )}
    </>
  );
};

export default AuthGuard;
