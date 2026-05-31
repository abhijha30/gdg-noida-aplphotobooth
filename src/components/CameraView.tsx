"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GDGLogo } from "./GDGLogo";
import { JerseyPosition } from "@/hooks/useFaceDetection";

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  jerseyPosition: JerseyPosition | null;
  faceCount: number;
  onCapture: () => void;
  onBack: () => void;
  isCapturing: boolean;
}

export interface CameraViewHandle {
  triggerFlash: () => void;
}

const COUNTDOWN_SECONDS = 3;

export const CameraView = forwardRef<CameraViewHandle, CameraViewProps>(
  function CameraView(
    { videoRef, jerseyPosition, faceCount, onCapture, onBack, isCapturing },
    ref
  ) {
    const containerRef    = useRef<HTMLDivElement>(null);
    const jerseyCanvasRef = useRef<HTMLCanvasElement>(null);
    const jerseyImgRef    = useRef<HTMLImageElement | null>(null);
    const animFrameRef    = useRef<number | null>(null);

    const [countdown, setCountdown]             = useState<number | null>(null);
    const [showFlash, setShowFlash]             = useState(false);
    const [isLandscapeWarning, setIsLandscape]  = useState(false);
    const [canvasSize, setCanvasSize]           = useState({ w: 0, h: 0 });

    useImperativeHandle(ref, () => ({
      triggerFlash: () => {
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 400);
      },
    }));

    // Load jersey image once
    useEffect(() => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = "/jersey-overlay.png";
      img.onload = () => { jerseyImgRef.current = img; };
    }, []);

    // ─── BUG FIX #6 ──────────────────────────────────────────────────────────
    // The ResizeObserver must update canvas.width and canvas.height (the
    // *intrinsic* canvas resolution) to match the displayed pixel size.
    // Previously this was done via state, then applied in the draw useEffect.
    // However, changing canvas.width/height inside a draw loop resets the
    // context state (clears the canvas, loses transforms).  More importantly,
    // the canvas element itself needs its width/height attributes set to the
    // display size so that 1 canvas pixel == 1 CSS pixel, otherwise MediaPipe
    // coordinates (which are normalised to the video then mapped to the canvas)
    // won't align with what is drawn.
    //
    // We keep state as the trigger for re-rendering but apply the dimensions
    // directly to the canvas element in the draw effect, which is correct.
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const obs = new ResizeObserver((entries) => {
        const { width, height } = entries[0].contentRect;
        const w = Math.round(width);
        const h = Math.round(height);
        setCanvasSize({ w, h });

        // Also set canvas intrinsic size immediately so the face-detection
        // hook always reads the correct canvas.width / canvas.height
        const canvas = jerseyCanvasRef.current;
        if (canvas) {
          canvas.width  = w;
          canvas.height = h;
        }
      });
      obs.observe(el);
      return () => obs.disconnect();
    }, []);

    // Draw jersey overlay on canvas
    useEffect(() => {
      const canvas = jerseyCanvasRef.current;
      if (!canvas || canvasSize.w === 0) return;

      // Ensure intrinsic size is always current
      canvas.width  = canvasSize.w;
      canvas.height = canvasSize.h;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let running = true;

      const drawFrame = () => {
        if (!running) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (jerseyImgRef.current) {
          ctx.globalAlpha = 0.92;

          if (jerseyImgRef.current && jerseyPosition) {
            ctx.globalAlpha = jerseyPosition.opacity;

            ctx.drawImage(
              jerseyImgRef.current,
              jerseyPosition.x,
              jerseyPosition.y,
              jerseyPosition.width,
              jerseyPosition.height
            );

            ctx.globalAlpha = 1;
          }
          
          animFrameRef.current = requestAnimationFrame(drawFrame);
        };
      drawFrame();

      return () => {
        running = false;
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };
    }, [jerseyPosition, canvasSize]);
    // Note: videoRef removed from deps – we never read videoRef inside this
    // effect; it was a spurious dependency that caused extra redraws.

    // Orientation check
    useEffect(() => {
      const check = () => setIsLandscape(window.innerWidth > window.innerHeight);
      check();
      window.addEventListener("resize", check);
      return () => window.removeEventListener("resize", check);
    }, []);

    const startCountdown = useCallback(() => {
      if (countdown !== null) return;
      setCountdown(COUNTDOWN_SECONDS);
    }, [countdown]);

    // Countdown timer
    useEffect(() => {
      if (countdown === null) return;
      if (countdown === 0) {
        onCapture();
        setCountdown(null);
        return;
      }
      const t = setTimeout(() => setCountdown((c) => (c !== null ? c - 1 : null)), 1000);
      return () => clearTimeout(t);
    }, [countdown, onCapture]);

    return (
      <div className="relative w-full h-dvh flex flex-col bg-gdg-dark overflow-hidden">

        {/* Flash overlay */}
        <AnimatePresence>
          {showFlash && (
            <motion.div
              className="absolute inset-0 bg-white z-50 pointer-events-none"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            />
          )}
        </AnimatePresence>

        {/* Landscape warning */}
        <AnimatePresence>
          {isLandscapeWarning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gdg-dark/95 z-40 flex flex-col items-center justify-center gap-4 px-8 text-center"
            >
              <span className="text-5xl">📱</span>
              <p className="font-display font-700 text-xl text-white">
                Please rotate to portrait mode
              </p>
              <p className="text-white/50 text-sm">The photo booth works best in portrait orientation</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top HUD */}
        <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-safe-top pt-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white"
          >
            ←
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
            <GDGLogo size={18} />
            <span className="font-display font-700 text-sm text-white">GDG Noida</span>
          </div>

          {/* Face indicator */}
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border ${
              faceCount > 0
                ? "bg-gdg-green/20 border-gdg-green/40"
                : "bg-black/40 border-white/10"
            }`}
          >
            {faceCount > 0 ? "😊" : "🔍"}
          </div>
        </div>

        {/* Camera feed container */}
        <div
          ref={containerRef}
          className="relative flex-1 overflow-hidden"
          style={{ background: "#000" }}
        >
          {/* ─── BUG FIX #7 ─────────────────────────────────────────────────────
              The video is CSS-mirrored with scaleX(-1) which is correct for a
              selfie view.  The jersey canvas must NOT be mirrored – it draws
              the jersey with already-mirrored coordinates calculated in
              useFaceDetection.  If the canvas were also mirrored the jersey
              would appear on the wrong side.
              ─────────────────────────────────────────────────────────────────── */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />

          {/* Jersey canvas — NOT mirrored */}
          <canvas
            ref={jerseyCanvasRef}
            className="absolute inset-0 z-10 pointer-events-none"
            style={{ width: "100%", height: "100%" }}
          />

          {/* Face guide circle – centred dynamically if face detected, else static */}
          <div
            className="absolute z-20 pointer-events-none"
            style={
              jerseyPosition
                ? {
                    // Place guide circle above the jersey, roughly at face height
                    left: jerseyPosition.x + jerseyPosition.width  / 2,
                    top:  jerseyPosition.y - jerseyPosition.height * 0.10,
                    transform: "translate(-50%, -50%)",
                    width:  jerseyPosition.width  * 0.38,
                    height: jerseyPosition.width  * 0.38,
                  }
                : {
                    left: "50%", top: "20%",
                    transform: "translate(-50%, -50%)",
                    width: 112, height: 112,
                  }
            }
          >
            <div
              className="w-full h-full border-4 border-white rounded-full border-dashed animate-pulse"
            />
          </div>

          {/* Shoulder guides */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            <div className="absolute left-[10%] top-[30%] w-10 h-10 border-l-4 border-t-4 border-white rounded-tl-lg" />
            <div className="absolute right-[10%] top-[30%] w-10 h-10 border-r-4 border-t-4 border-white rounded-tr-lg" />
          </div>

          {/* Viewfinder corners */}
          <div className="absolute inset-6 pointer-events-none">
            <div className="absolute top-0 left-0  w-8 h-8 border-t-2 border-l-2 border-gdg-blue  rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gdg-red   rounded-tr-lg" />
            <div className="absolute bottom-0 left-0  w-8 h-8 border-b-2 border-l-2 border-gdg-green  rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gdg-yellow rounded-br-lg" />
            <div className="scan-line" />
          </div>

          {/* Face guide hint */}
          <AnimatePresence>
            {faceCount === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-x-0 top-1/4 flex justify-center pointer-events-none"
              >
                <div className="px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/10">
                  <p className="text-white/70 text-xs font-body">
                    👕 Align your face and shoulders with the guide
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Countdown */}
          <AnimatePresence>
            {countdown !== null && countdown > 0 && (
              <motion.div
                key={countdown}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                <div className="countdown-num">{countdown}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom controls */}
        <div className="relative z-20 px-6 py-5 safe-bottom flex flex-col items-center gap-4 bg-gradient-to-t from-gdg-dark to-transparent">
          <div className="flex items-center gap-2 text-xs text-white/40 font-body tracking-widest">
            <span className="text-gdg-blue">●</span> LEARN
            <span className="text-gdg-yellow">●</span> BUILD
            <span className="text-gdg-green">●</span> CONNECT
          </div>

          <button
            onClick={startCountdown}
            disabled={isCapturing || countdown !== null}
            className="relative w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: "white",
              boxShadow: countdown !== null
                ? "0 0 40px rgba(66,133,244,0.8), 0 0 80px rgba(66,133,244,0.4)"
                : "0 0 30px rgba(255,255,255,0.3)",
            }}
          >
            <div
              className="absolute inset-[-5px] rounded-full border-[3px]"
              style={{
                borderRadius: "50%",
                border: "3px solid transparent",
                background:
                  "linear-gradient(#0A0A0F, #0A0A0F) padding-box, linear-gradient(135deg, #4285F4, #EA4335, #FBBC04, #34A853) border-box",
              }}
            />
            {isCapturing ? (
              <div className="w-6 h-6 border-2 border-gdg-blue border-t-transparent rounded-full animate-spin" />
            ) : countdown !== null ? (
              <span className="text-gdg-blue font-display font-900 text-2xl">{countdown}</span>
            ) : (
              <span className="text-2xl">📸</span>
            )}
          </button>

          <p className="text-white/30 text-[11px] font-body">
            {countdown !== null ? "Get ready!" : "Tap to take selfie"}
          </p>
        </div>
      </div>
    );
  }
);
