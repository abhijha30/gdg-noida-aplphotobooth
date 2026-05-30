"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CameraState = "idle" | "requesting" | "active" | "error";

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  state: CameraState;
  errorMessage: string;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  stream: MediaStream | null;
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setState("idle");
  }, []);

  const startCamera = useCallback(async () => {
    setState("requesting");
    setErrorMessage("");

    // iOS Safari needs specific constraints
    const constraints: MediaStreamConstraints = {
      audio: false,
      video: {
        facingMode: "user",
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
      },
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.setAttribute("autoplay", "true");
        videoRef.current.muted = true;

        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) return reject(new Error("No video element"));
          videoRef.current.onloadedmetadata = () => {
            videoRef.current!.play()
              .then(() => resolve())
              .catch(reject);
          };
          videoRef.current.onerror = () => reject(new Error("Video error"));
        });
      }
      setState("active");
    } catch (err: unknown) {
      console.error("Camera error:", err);
      stopCamera();

      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setErrorMessage(
            "Camera access denied. Please allow camera access in your browser settings and refresh."
          );
        } else if (err.name === "NotFoundError") {
          setErrorMessage("No camera found on this device.");
        } else if (err.name === "NotReadableError") {
          setErrorMessage("Camera is in use by another app. Please close other apps and try again.");
        } else {
          setErrorMessage("Could not access camera: " + err.message);
        }
      } else {
        setErrorMessage("Unknown camera error. Please refresh and try again.");
      }
      setState("error");
    }
  }, [stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    state,
    errorMessage,
    startCamera,
    stopCamera,
    stream: streamRef.current,
  };
}
