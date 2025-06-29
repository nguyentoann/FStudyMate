import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../services/config";

const JokeNotification = () => {
  const { user } = useAuth();
  const [show, setShow] = useState(false);

  // Check if the current user is the target for the joke
  useEffect(() => {
    if (user) {
      console.log("JokeNotification: Checking user", user);

      const isTargetUser =
        user.username === "SE181558" ||
        user.loginId === "SE181558" ||
        user.id === "SE181558" ||
        (user.email && user.email.includes("SE181558"));

      console.log("JokeNotification: Is target user?", isTargetUser);

      if (isTargetUser) {
        console.log(
          "JokeNotification: Target user found, showing notification"
        );
        // Show notification after a short delay
        const timer = setTimeout(() => {
          setShow(true);
        }, 1000);

        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  // Close notification
  const handleClose = () => {
    console.log("JokeNotification: Closing notification");
    setShow(false);
  };

  if (!show) {
    return null;
  }

  console.log("JokeNotification: Rendering notification");

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[1000] animate-bounce-in">
      <div className="bg-white rounded-lg shadow-2xl overflow-hidden max-w-md">
        <div className="relative">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
            aria-label="Close"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default JokeNotification;
