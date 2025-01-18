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

  const Modal = useCallback(
    ({ closeOnOverlayClick = true }) => {
      if (!isOpen) return null;

      const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && closeOnOverlayClick) {
          closeModal();
        }
      };

      return createPortal(
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleOverlayClick}
          style={{
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          <div
            className=" m-4 bg-white rounded-lg p-4 transform transition-transform duration-300"
            style={{
              animation: "scaleIn 0.3s ease-out",
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

// Add fade and scale animations
const styles = document.createElement("style");
styles.textContent = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.95); }
  to { transform: scale(1); }
}`;
document.head.appendChild(styles);

// Usage Example:
// const { Modal, openModal, closeModal } = useModal();
// <button onClick={() => openModal(<YourComponent />)}>Open Modal</button>
// <Modal closeOnOverlayClick={true} />
