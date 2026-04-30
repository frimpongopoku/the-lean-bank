"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "../components/Loading";

// Init now happens automatically on login. This page just redirects.
export default function InitializeAccount() {
  const router = useRouter();
  useEffect(() => { router.replace("/home"); }, []);
  return <Loading full message="Setting up your account…" />;
}
