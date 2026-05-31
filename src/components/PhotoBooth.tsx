import React, { useState, useCallback } from "react";
import WelcomeScreen from "./WelcomeScreen";
import CameraView from "./CameraView";
import ResultScreen from "./ResultScreen";

type BoothState = "welcome" | "camera" | "result";

const PhotoBooth: React.FC = () => {
  const [state, setState]     = useState<BoothState>("welcome");
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [selfieCount, setSelfieCount] = useState(0);

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
