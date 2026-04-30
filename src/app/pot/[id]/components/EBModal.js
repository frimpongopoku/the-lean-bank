"use client";
import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

export function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState(null);

  const openModal = useCallback((customContent) => {
    setContent(customContent);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
    };
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, closeModal]);

  const Modal = useCallback(
    ({ closeOnOverlayClick = true }) => {
      if (!isOpen) return null;

      const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && closeOnOverlayClick) closeModal();
      };

      return createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(4,9,20,0.75)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            animation: "fadeIn 0.2s ease-out",
          }}
          onClick={handleOverlayClick}
        >
          <div
            style={{
              background: "rgba(10,18,38,0.92)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "20px",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow:
                "0 24px 80px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.06)",
              animation: "scaleIn 0.25s ease-out",
              maxWidth: "520px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {content}
          </div>
        </div>,
        document.body
      );
    },
    [isOpen, content, closeModal]
  );

  return { Modal, openModal, closeModal };
}
