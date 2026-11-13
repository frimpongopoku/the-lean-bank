"use client";
import { useRouter } from "next/navigation";
import Icon from "./ui/Icon";

const Fallback = ({ message = "Something went wrong.", backUrl = "/", title = "Not found" }) => {
  const router = useRouter();
  return (
    <div className="flex items-center justify-center min-h-[100dvh] px-4">
      <div className="card text-center flex flex-col items-center px-8 py-10 max-w-sm w-full gap-3">
        <span className="w-11 h-11 rounded-full bg-raised text-amber inline-flex items-center justify-center">
          <Icon name="alert" size={20} />
        </span>
        <h1 className="text-lg font-semibold text-ink m-0">{title}</h1>
        <p className="text-muted text-sm m-0 mb-3">{message}</p>
        <button onClick={() => (backUrl ? router.push(backUrl) : router.back())} className="btn-ghost">
          <Icon name="chevronLeft" />
          Back to pots
        </button>
      </div>
    </div>
  );
};

export default Fallback;
