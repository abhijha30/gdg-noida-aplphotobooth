import { useEffect, useRef, useState } from "react";

export interface FacePosition {
  x: number;       // 0–1 normalised
  y: number;       // 0–1 normalised
  width: number;   // 0–1 normalised
  height: number;  // 0–1 normalised
  detected: boolean;
}

/**
 * Optional face detection for UI guidance only.
 * The jersey overlay position is NEVER driven by this data.
 * Falls back gracefully when MediaPipe / face API is unavailable.
 */
export function useFaceDetection(videoRef: React.RefObject<HTMLVideoElement>) {
  const [facePosition, setFacePosition] = useState<FacePosition>({
    x: 0.5,
    y: 0.25,
    width: 0.3,
    height: 0.3,
    detected: false,
  });
  const rafRef = useRef<number>(0);
  const detectorRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    async function setupDetector() {
      try {
        // Try to use the browser's built-in FaceDetector if available
        if ("FaceDetector" in window) {
          detectorRef.current = new (window as any).FaceDetector({
            fastMode: true,
            maxDetectedFaces: 1,
          });
        }
      } catch {
        // Not available — silently ignore; overlay still works perfectly
      }
    }

    async function detectLoop() {
      if (cancelled) return;
      const video = videoRef.current;
      if (!video || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(detectLoop);
        return;
      }

      if (detectorRef.current) {
        try {
          const faces = await detectorRef.current.detect(video);
          if (!cancelled && faces.length > 0) {
            const f = faces[0].boundingBox;
            setFacePosition({
              x: f.x / video.videoWidth,
              y: f.y / video.videoHeight,
              width: f.width / video.videoWidth,
              height: f.height / video.videoHeight,
              detected: true,
            });
          } else if (!cancelled) {
            setFacePosition((p) => ({ ...p, detected: false }));
          }
        } catch {
          setFacePosition((p) => ({ ...p, detected: false }));
        }
      }

      rafRef.current = requestAnimationFrame(detectLoop);
    }

    setupDetector().then(detectLoop);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
    };
  }, [videoRef]);

  return facePosition;
}
