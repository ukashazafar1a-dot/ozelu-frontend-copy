"use client";
import React, { useEffect } from "react";
import Clarity from "@microsoft/clarity";

const MicrosoftClarity = () => {
  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  useEffect(() => {
    // Add check to prevent double initialization and ensure browser environment
    if (process.env.NODE_ENV === "production" && typeof window !== "undefined" && projectId) {
      try {
        Clarity.init(projectId);
      } catch (error) {
        console.warn("Failed to initialize Clarity:", error);
      }
    }
  }, [projectId]);
  return null; // Using null instead of empty fragment is slightly more efficient
};

export default MicrosoftClarity;
