"use client";
import { UNDEFINED, useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "../components/Loading";

// Sign out now lives in the header's account menu; `signout` is accepted for
// backwards compatibility and ignored.
// eslint-disable-next-line no-unused-vars
const AuthGuard = ({ children, signout = false }) => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/auth");
  }, [user, router]);

  if (user === UNDEFINED) return <Loading full />;

  return <>{children}</>;
};

export default AuthGuard;
