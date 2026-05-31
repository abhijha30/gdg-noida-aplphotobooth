"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import WelcomeScreen from "./WelcomeScreen";
import CameraView from "./CameraView";
import ResultScreen from "./ResultScreen";

type BoothState = "welcome" | "camera" | "result";

const STORAGE_KEY = "gdg_noida_photo_count";

function getParticipantCount(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
}

function incrementParticipantCount(): number {
  const next = getParticipantCount() + 1;
  localStorage.setItem(STORAGE_KEY, String(next));
  return next;
}

export default function PhotoBooth() {
  const [state, setState] = useState<BoothState>("welcome");
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [selfieCount, setSelfieCount] = useState(0);

  // Load participant count from localStorage on mount
  useEffect(() => {
    setSelfieCount(getParticipantCount());
  }, []);

  const handleStart = useCallback(() => {
    setState("camera");
  }, []);

  const handleCapture = useCallback((dataUrl: string) => {
    setPhotoUrl(dataUrl);
    const newCount = incrementParticipantCount();
    setSelfieCount(newCount);
    setState("result");
  }, []);

  const handleRetake = useCallback(() => {
    setPhotoUrl("");
    setState("camera");
  }, []);

  const handleHome = useCallback(() => {
    setPhotoUrl("");
    setState("welcome");
  }, []);

  return (
    <div className="photobooth-app">
      {state === "welcome" && (
        <WelcomeScreen onStart={handleStart} selfieCount={selfieCount} />
      )}
      {state === "camera" && (
        <CameraView onCapture={handleCapture} onBack={handleHome} />
      )}
      {state === "result" && (
        <ResultScreen
          photoUrl={photoUrl}
          onRetake={handleRetake}
          onHome={handleHome}
        />
      )}
    </div>
  );
}
