"use client";
import { UNDEFINED, useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "../components/Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";

const AuthGuard = ({ children, signout = false }) => {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/auth");
  }, [user, router]);

  if (user === UNDEFINED) return <Loading full />;

  return (
    <>
      {children}
      {signout && (
        <button
          onClick={logout}
          title="Sign out"
          className="fixed bottom-5 right-5 flex items-center gap-2 text-xs font-semibold text-white/30 hover:text-brand-rose transition-colors duration-200 z-50"
        >
          <FontAwesomeIcon icon={faArrowRightFromBracket} />
          Sign Out
        </button>
      )}
    </>
  );
};

export default AuthGuard;
