"use client";
import React, { useState } from "react";
import { animated, useSpring } from "@react-spring/web";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const TabViewer = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  const slideStyles = useSpring({
    transform: `translateX(-${activeTab * 100}%)`,
    config: { tension: 280, friction: 32, precision: 0.01 },
  });

  return (
    <div className="w-full">
      {/* Tab bar */}
      <div
        className="flex gap-1 p-1 mb-6 rounded-xl"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex-1 justify-center whitespace-nowrap ${
              activeTab === index
                ? "text-white"
                : "text-white/40 hover:text-white/65"
            }`}
            style={
              activeTab === index
                ? {
                    background: "rgba(16,185,129,0.14)",
                    border: "1px solid rgba(16,185,129,0.25)",
                    color: "#10b981",
                  }
                : {}
            }
          >
            {tab.icon && (
              <FontAwesomeIcon icon={tab.icon} className="text-xs" />
            )}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sliding content */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: "60vh" }}>
        <animated.div
          style={slideStyles}
          className="flex"
        >
          {tabs.map((tab, index) => (
            <div
              key={index}
              className="w-full flex-shrink-0 overflow-auto"
              style={{ minHeight: "60vh" }}
            >
              {tab.content}
            </div>
          ))}
        </animated.div>
      </div>
    </div>
  );
};
