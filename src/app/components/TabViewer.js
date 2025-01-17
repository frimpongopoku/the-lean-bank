"use client";
import React, { useState } from "react";
import { animated, useSpring } from "@react-spring/web";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const TabViewer = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  const slideStyles = useSpring({
    transform: `translateX(-${activeTab * 100}%)`,
    // config: { tension: 300, friction: 20 }, // Faster animation
    config: {
      tension: 250, // Adjusted for smoother motion
      friction: 30,
      precision: 0.01,
      easing: (t) => t * (2 - t), // Ease-in-out easing function
    },
  });

  return (
    <div className="w-full h-full">
      {/* Tab Headers */}
      <div className="flex overflow-x-auto no-scrollbar border-b border-gray-300">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`flex items-center p-2 text-sm whitespace-nowrap rounded-none transition-colors duration-200 ${
              activeTab === index
                ? "bg-gray-700 text-white font-bold"
                : "bg-transparent text-gray-500 hover:bg-gray-200"
            }`}
          >
            {tab.icon && <FontAwesomeIcon icon={tab.icon} className="mr-2" />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="relative w-full h-[70vh] overflow-hidden">
        <animated.div
          style={slideStyles}
          className="flex h-full transition-transform duration-100"
        >
          {tabs.map((tab, index) => (
            <div
              key={index}
              className="w-full h-full flex-shrink-0 overflow-auto "
            >
              {tab.content}
            </div>
          ))}
        </animated.div>
      </div>
    </div>
  );
};
