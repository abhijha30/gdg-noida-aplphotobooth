"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useCamera } from "@/hooks/useCamera";
import { useFaceDetection } from "@/hooks/useFaceDetection";
import { usePhotoCapture } from "@/hooks/usePhotoCapture";
import { useConfetti } from "@/hooks/useConfetti";

import { WelcomeScreen } from "./WelcomeScreen";
import { CameraView, CameraViewHandle } from "./CameraView";
import { PhotoResult } from "./PhotoResult";
import { CameraError } from "./CameraError";

type Screen = "welcome" | "camera" | "result" | "error";

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
  const [screen, setScreen] = useState<Screen>("welcome");
  const [participantCount, setParticipantCount] = useState(0);
  const cameraViewRef = useRef<CameraViewHandle>(null);

  const { videoRef, state: camState, errorMessage, startCamera, stopCamera } = useCamera();
  const { jerseyPosition, faceCount, startDetection, stopDetection } = useFaceDetection();
  const { capturedPhoto, isCapturing, capturePhoto, downloadPhoto, shareToInstagram, resetPhoto } =
    usePhotoCapture();
  const { fire: fireConfetti } = useConfetti();

  // Load jersey image ref for capture
  const jerseyImgRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/gdg-overlay-v2.png";
    img.onload = () => {
      jerseyImgRef.current = img;
    };
  }, []);

  // Load participant count
  useEffect(() => {
    setParticipantCount(getParticipantCount());
  }, []);

  // Start camera when screen = camera
  useEffect(() => {
    if (screen === "camera") {
      startCamera();
    }
  }, [screen, startCamera]);

  // Start face detection when camera is active
  useEffect(() => {
    if (camState === "active" && videoRef.current) {
      startDetection(videoRef.current);
    }
    if (camState === "error") {
      setScreen("error");
    }
  }, [camState, videoRef, startDetection]);

  // Handle capture
  const handleCapture = useCallback(async () => {
    if (!videoRef.current) return;

    // Flash
    cameraViewRef.current?.triggerFlash();

    await capturePhoto(videoRef.current, jerseyImgRef.current, jerseyPosition);
    stopCamera();
    stopDetection();

    // Confetti + counter
    fireConfetti();
    const newCount = incrementParticipantCount();
    setParticipantCount(newCount);

    setScreen("result");
  }, [videoRef, capturePhoto, jerseyPosition, stopCamera, stopDetection, fireConfetti]);

  const handleStart = useCallback(() => {
    setScreen("camera");
  }, []);

  const handleBack = useCallback(() => {
    stopCamera();
    stopDetection();
    setScreen("welcome");
  }, [stopCamera, stopDetection]);

  const handleRetake = useCallback(() => {
    resetPhoto();
    setScreen("camera");
    startCamera();
  }, [resetPhoto, startCamera]);

  const handleRetry = useCallback(() => {
    setScreen("camera");
    startCamera();
  }, [startCamera]);

  return (
    <div className="relative w-full min-h-dvh bg-gdg-dark overflow-hidden">
      <AnimatePresence mode="wait">
        {screen === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <WelcomeScreen onStart={handleStart} participantCount={participantCount} />
          </motion.div>
        )}

        {(screen === "camera" || screen === "error") && camState === "error" ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <CameraError
              message={errorMessage}
              onRetry={handleRetry}
              onBack={handleBack}
            />
          </motion.div>
        ) : screen === "camera" ? (
          <motion.div
            key="camera"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {camState === "requesting" && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gdg-dark gap-4">
                <div className="w-16 h-16 border-3 border-gdg-blue border-t-transparent rounded-full animate-spin" />
                <p className="font-display font-600 text-white/60">Accessing camera…</p>
              </div>
            )}
            <CameraView
              ref={cameraViewRef}
              videoRef={videoRef}
              jerseyPosition={jerseyPosition}
              faceCount={faceCount}
              onCapture={handleCapture}
              onBack={handleBack}
              isCapturing={isCapturing}
            />
          </motion.div>
        ) : null}

        {screen === "result" && capturedPhoto && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <PhotoResult
              photo={capturedPhoto}
              onDownload={downloadPhoto}
              onShare={shareToInstagram}
              onRetake={handleRetake}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
