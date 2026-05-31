import React, { useState, useCallback } from "react";
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
    setState("camera");
  }, []);

  const handleCapture = useCallback((dataUrl: string) => {
    setPhotoUrl(dataUrl);
    setSelfieCount((c) => c + 1);
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
};

export default PhotoBooth;
