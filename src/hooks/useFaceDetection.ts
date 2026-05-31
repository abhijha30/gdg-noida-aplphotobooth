"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface FaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface JerseyPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
}

interface UseFaceDetectionReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  jerseyPosition: JerseyPosition | null;
  isDetecting: boolean;
  faceCount: number;
  startDetection: (video: HTMLVideoElement) => void;
  stopDetection: () => void;
}

// Faster tracking
const LERP = 0.35;

let faceDetectionModule: typeof import("@mediapipe/face_detection") | null = null;

async function loadFaceDetection() {
  if (faceDetectionModule) return faceDetectionModule;
  faceDetectionModule = await import("@mediapipe/face_detection");
  return faceDetectionModule;
}

export function useFaceDetection(): UseFaceDetectionReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef =
    useRef<InstanceType<typeof import("@mediapipe/face_detection").FaceDetection> | null>(null);

  const rafRef = useRef<number | null>(null);
  const smoothedPos = useRef<JerseyPosition | null>(null);

  const [jerseyPosition, setJerseyPosition] = useState<JerseyPosition | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [faceCount, setFaceCount] = useState(0);

  const stopDetection = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    setIsDetecting(false);
  }, []);

  const startDetection = useCallback(async (video: HTMLVideoElement) => {
    setIsDetecting(true);

    try {
      const mp = await loadFaceDetection();
      const FaceDetection = mp.FaceDetection;

      const detector = new FaceDetection({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4/${file}`,
      });

      detector.setOptions({
        model: "short",
        minDetectionConfidence: 0.5,
      });

      detector.onResults((results: import("@mediapipe/face_detection").Results) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const cw = canvas.width;
        const ch = canvas.height;

        if (results.detections && results.detections.length > 0) {
          setFaceCount(results.detections.length);

          const detection = results.detections[0];
          const bbox = detection.boundingBox;

          const faceX = (bbox.xCenter - bbox.width / 2) * cw;
          const faceY = (bbox.yCenter - bbox.height / 2) * ch;
          const faceW = bbox.width * cw;
          const faceH = bbox.height * ch;

         // BETTER BODY FITTING

        const faceSize = Math.max(faceW, faceH);

        // Scale automatically according to distance
        const jerseyWidth = faceSize * 3.2;
        const jerseyHeight = jerseyWidth * 1.35;

        // Center jersey on face
        const jerseyX =
          faceX + (faceW / 2) - (jerseyWidth / 2);

        // Move jersey BELOW chin
        const jerseyY =
          faceY + (faceH * 0.95);

          const target: JerseyPosition = {
            x: jerseyX,
            y: jerseyY,
            width: jerseyWidth,
            height: jerseyHeight,
            opacity: 1,
          };

          if (!smoothedPos.current) {
            smoothedPos.current = target;
          } else {
            smoothedPos.current = {
              x:
                smoothedPos.current.x +
                (target.x - smoothedPos.current.x) * LERP,

              y:
                smoothedPos.current.y +
                (target.y - smoothedPos.current.y) * LERP,

              width:
                smoothedPos.current.width +
                (target.width - smoothedPos.current.width) * LERP,

              height:
                smoothedPos.current.height +
                (target.height - smoothedPos.current.height) * LERP,

              opacity: 1,
            };
          }

          setJerseyPosition({ ...smoothedPos.current });
        } else {
          setFaceCount(0);

          if (smoothedPos.current) {
            smoothedPos.current = {
              ...smoothedPos.current,
              opacity: Math.max(
                0,
                smoothedPos.current.opacity - 0.05
              ),
            };

            setJerseyPosition({ ...smoothedPos.current });
          }
        }
      });

      detectorRef.current = detector;

      const detect = async () => {
        if (!video || video.readyState < 2) {
          rafRef.current = requestAnimationFrame(detect);
          return;
        }

        try {
          await detector.send({ image: video });
        } catch {}

        rafRef.current = requestAnimationFrame(detect);
      };

      rafRef.current = requestAnimationFrame(detect);
    } catch (err) {
      console.error("Face detection init error:", err);

      setIsDetecting(false);

      const canvas = canvasRef.current;

      if (canvas) {
        const fallback: JerseyPosition = {
          x: canvas.width * 0.1,
          y: canvas.height * 0.35,
          width: canvas.width * 0.8,
          height: canvas.width * 1.05,
          opacity: 1,
        };

        smoothedPos.current = fallback;
        setJerseyPosition(fallback);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      stopDetection();

      if (detectorRef.current) {
        detectorRef.current.close();
      }
    };
  }, [stopDetection]);

  return {
    canvasRef,
    jerseyPosition,
    isDetecting,
    faceCount,
    startDetection,
    stopDetection,
  };
}
