// components/Fallback.js
"use client";
import { useRouter } from "next/navigation";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

const Fallback = ({ message = "Something went wrong.", backUrl = "/" }) => {
  const router = useRouter();

  const handleGoBack = () => {
    if (backUrl) return router.push(backUrl);
    router.back();
  };

  return (
    <div className="flex items-center justify-center h-screen  bg-gray-100">
      <div className="text-center flex flex-col items-center p-6 bg-white rounded shadow-md w-1/4">
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          className="text-yellow-500 text-4xl mb-4"
        />
        <h1 className="text-xl font-semibold mb-2">Oops!</h1>
        <p className="text-gray-700 mb-4">{message}</p>
        <button
          onClick={handleGoBack}
          className="flex items-center px-4 py-2 bg-blue-500 text-white font-medium rounded hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Go Back
        </button>
      </div>
    </div>
  );
};

Fallback.propTypes = {
  message: PropTypes.string,
  backUrl: PropTypes.string,
};

export default Fallback;
