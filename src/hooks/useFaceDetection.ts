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
  // Store the canvas dimensions at detection time so capture can rescale correctly
  canvasW: number;
  canvasH: number;
}

interface UseFaceDetectionReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  jerseyPosition: JerseyPosition | null;
  isDetecting: boolean;
  faceCount: number;
  startDetection: (video: HTMLVideoElement) => void;
  stopDetection: () => void;
}

// Smooth tracking – lower = smoother but laggier, higher = snappier
const LERP = 0.2;

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

        // ─── BUG FIX #1 ────────────────────────────────────────────────────────
        // The canvas.width / canvas.height must reflect the actual rendered pixel
        // size of the canvas DOM element, NOT the intrinsic video resolution.
        // MediaPipe returns normalised [0..1] coords relative to the image it
        // processed (the video frame), but we display the video scaled to fill
        // the container.  We must therefore map the normalised coords onto the
        // *display* canvas dimensions, not the video's native resolution.
        //
        // canvas.width and canvas.height are set by the ResizeObserver in
        // CameraView, so they already represent the display size – that is
        // correct.  The previous code was fine here but it set jerseyX to the
        // face-centred value WITHOUT accounting for the mirroring applied to the
        // video element (CSS scaleX(-1)).  MediaPipe processes the raw (un-
        // mirrored) frame, so detection coords are in un-mirrored space.  When
        // the canvas draws on top of a CSS-mirrored video the x-axis is flipped,
        // so we must mirror the x coordinate before drawing.
        // ────────────────────────────────────────────────────────────────────────

        const cw = canvas.width;
        const ch = canvas.height;

        if (results.detections && results.detections.length > 0) {
          setFaceCount(results.detections.length);

          const detection = results.detections[0];
          const bbox = detection.boundingBox;

          // Raw (un-mirrored) face bounds in display-canvas pixels
          const rawFaceX = (bbox.xCenter - bbox.width / 2) * cw;
          const faceY    = (bbox.yCenter - bbox.height / 2) * ch;
          const faceW    = bbox.width  * cw;
          const faceH    = bbox.height * ch;

          // ─── BUG FIX #2 ──────────────────────────────────────────────────────
          // Mirror the x coordinate to match the CSS scaleX(-1) on the video.
          // Without this the jersey trails to the opposite side from the face.
          const mirroredFaceCenterX = cw - (rawFaceX + faceW / 2);
          // ─────────────────────────────────────────────────────────────────────

        const faceSize = Math.max(faceW, faceH);

        // Wider shoulders
        const jerseyWidth = faceSize * 4.6;

        // Cropped jersey = shorter height
        const jerseyHeight = jerseyWidth * 0.72;

        // Center on face
        const jerseyX =
          mirroredFaceCenterX - jerseyWidth / 2;

        // Collar should sit around neck
        const jerseyY =
          faceY + faceH * 0.55;
          const target: JerseyPosition = {
            x: jerseyX,
            y: jerseyY,
            width: jerseyWidth,
            height: jerseyHeight,
            opacity: 1,
            canvasW: cw,
            canvasH: ch,
          };

          if (!smoothedPos.current) {
            smoothedPos.current = target;
          } else {
            smoothedPos.current = {
              x:       smoothedPos.current.x      + (target.x      - smoothedPos.current.x)      * LERP,
              y:       smoothedPos.current.y      + (target.y      - smoothedPos.current.y)      * LERP,
              width:   smoothedPos.current.width  + (target.width  - smoothedPos.current.width)  * LERP,
              height:  smoothedPos.current.height + (target.height - smoothedPos.current.height) * LERP,
              opacity: 1,
              canvasW: cw,
              canvasH: ch,
            };
          }

          setJerseyPosition({ ...smoothedPos.current });
        } else {
          setFaceCount(0);

          if (smoothedPos.current) {
            smoothedPos.current = {
              ...smoothedPos.current,
              opacity: Math.max(0, smoothedPos.current.opacity - 0.05),
              canvasW: cw,
              canvasH: ch,
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
        } catch { /* ignore transient errors */ }
        rafRef.current = requestAnimationFrame(detect);
      };

      rafRef.current = requestAnimationFrame(detect);
    } catch (err) {
      console.error("Face detection init error:", err);
      setIsDetecting(false);

      // ─── BUG FIX #4 ──────────────────────────────────────────────────────────
      // Fallback position: place jersey centred in lower-half of canvas rather
      // than using hardcoded 0.1/0.35 which looks wrong on all screen sizes.
      const canvas = canvasRef.current;
      if (canvas) {
        const cw = canvas.width  || 390;
        const ch = canvas.height || 700;
        const jw = cw * 0.82;
        const jh = jw * 0.72;
        const fallback: JerseyPosition = {
          x:       (cw - jw) / 2,
          y:       ch * 0.30,
          width:   jw,
          height:  jh,
          opacity: 1,
          canvasW: cw,
          canvasH: ch,
        };
        smoothedPos.current = fallback;
        setJerseyPosition(fallback);
      }
      // ─────────────────────────────────────────────────────────────────────────
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
