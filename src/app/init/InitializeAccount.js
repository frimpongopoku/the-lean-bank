"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faAngleRight,
  faHammer,
  faHandPointUp,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import {
  getAllPots,
  getUserCollection,
  initUserCollection,
  NOT_FOUND,
} from "../auth/utils/firestore-utils";
import { useAuth } from "../auth/context/AuthContext";

export default function InitializeAccount() {
  const { user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    setInitLoading(true);
    getAllPots(user?.uid).then((response) => {
      setInitLoading(false);
      if (response !== NOT_FOUND) return router.push("/home");
      setError("Not Setup Yet!");
    });
  }, [user?.uid]);

  const init = () => {
    setLoading(true);
    setError("");
    initUserCollection(user?.uid, (complete, error) => {
      setLoading(false);
      if (complete) router.push("/home");
      setError(error);
    });
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className=" flex flex-col items-center text-center">
        <p className="text-2xl font-bold text-green-600 mb-3">
          Almost There, {user?.displayName}{" "}
          <FontAwesomeIcon icon={faHandPointUp} />
        </p>
        <h1 className="text-md font-normal mb-4 text-gray-500">
          It appears you did not complete the setup process.
          <br /> Please click the button below to finalize your setup.
        </h1>
        {initLoading ? (
          <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
        ) : (
          <button
            disabled={!user?.uid}
            onClick={() => init()}
            className="flex items-center hover:bg-green-800  gap-2 bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            {/* <FontAwesomeIcon icon={faGoogle} /> */}
            Setup{" "}
            <FontAwesomeIcon
              className={loading ? "animate-spin" : ""}
              icon={loading ? faSpinner : faHammer}
            />
          </button>
        )}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
}
