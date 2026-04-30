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
    <div className="flex items-center justify-center h-screen">
      <div className="glass text-center flex flex-col items-center px-10 py-12 max-w-sm w-full animate-scale-in">
        <div className="w-14 h-14 rounded-full bg-brand-amber/10 flex items-center justify-center mb-5">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="text-brand-amber text-xl"
          />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Oops!</h1>
        <p className="text-text-muted mb-7 text-sm leading-relaxed">{message}</p>
        <button onClick={handleGoBack} className="btn-ghost text-sm">
          <FontAwesomeIcon icon={faArrowLeft} />
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
