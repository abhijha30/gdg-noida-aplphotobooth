import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useFaceDetection } from "../hooks/useFaceDetection";
import { usePhotoCapture } from "../hooks/usePhotoCapture";

// ─── Jersey positioning constants ────────────────────────────────────────────
// These are the ONLY values that control the jersey overlay.
// MediaPipe / face detection NEVER modifies these.
//
// CSS overlay (live preview):
//   width  = JERSEY_WIDTH_PCT % of the container width
//   top    = JERSEY_TOP_PCT   % of the container height  (collar anchor)
//   left   = 50% with translateX(-50%) → horizontally centred
//
// Canvas capture must replicate these exactly.
const JERSEY_WIDTH_PCT  = 0.92;   // 92 % of frame width
const JERSEY_TOP_PCT    = 0.38;   // collar top at 38 % from top

interface CameraViewProps {
  onCapture: (dataUrl: string) => void;
  onBack: () => void;
}

type CameraState = "requesting" | "active" | "error" | "countdown" | "captured";

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onBack }) => {
  const videoRef        = useRef<HTMLVideoElement>(null);
  const containerRef    = useRef<HTMLDivElement>(null);
  const overlayImgRef   = useRef<HTMLImageElement>(null);
  const streamRef       = useRef<MediaStream | null>(null);

  const [cameraState, setCameraState] = useState<CameraState>("requesting");
  const [countdown, setCountdown]      = useState(0);
  const [flashActive, setFlashActive]  = useState(false);
  const [jerseyLoaded, setJerseyLoaded] = useState(false);

  // Face detection — UI guidance only, NOT used for positioning
  const facePos = useFaceDetection(videoRef);

  // Photo capture hook
  const { capturePhoto } = usePhotoCapture(videoRef, overlayImgRef);

  // ── Start camera ──────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      try {
        // Prefer environment-facing on mobile; fall back to user (front) camera
        // For a selfie photobooth we actually want the FRONT camera
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: "user",
            width:  { ideal: 1080 },
            height: { ideal: 1920 },
            aspectRatio: { ideal: 9 / 16 },
          },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            if (mounted) setCameraState("active");
          };
        }
      } catch (err) {
        console.error("Camera error:", err);
        if (mounted) setCameraState("error");
      }
    }

    startCamera();

    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ── Countdown → capture ───────────────────────────────────────────────────
  const startCountdown = useCallback(() => {
    if (cameraState !== "active") return;
    setCameraState("countdown");
    let count = 3;
    setCountdown(count);

    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        setCountdown(0);
        doCapture();
      }
    }, 1000);
  }, [cameraState]); // eslint-disable-line react-hooks/exhaustive-deps

  const doCapture = useCallback(() => {
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 300);

    const result = capturePhoto();
    if (result) {
      setCameraState("captured");
      onCapture(result.dataUrl);
    } else {
      setCameraState("active");
    }
  }, [capturePhoto, onCapture]);

  // ── Jersey overlay CSS ────────────────────────────────────────────────────
  //
  // The overlay sits on top of the video using absolute positioning.
  // It is ALWAYS visible from the first frame — no waiting for face detection.
  //
  // Layout:
  //   - width  = 92 vw (relative to the video container)
  //   - left   = 50 %, transform: translateX(-50 %) → centred
  //   - top    = 38 % → collar anchor for natural selfie alignment
  //   - aspect ratio preserved (CSS `object-fit: contain`)
  //
  const jerseyStyle = useMemo<React.CSSProperties>(() => ({
    position: "absolute",
    width:    `${JERSEY_WIDTH_PCT * 100}%`,
    left:     "50%",
    top:      `${JERSEY_TOP_PCT * 100}%`,
    transform: "translateX(-50%)",
    pointerEvents: "none",
    zIndex: 10,
    opacity: jerseyLoaded ? 1 : 0,
    transition: "opacity 0.2s ease",
    // Preserve natural aspect ratio
    height: "auto",
  }), [jerseyLoaded]);

  // ── Face guide dot (optional UI feedback) ────────────────────────────────
  const faceGuideStyle = useMemo<React.CSSProperties>(() => ({
    position: "absolute",
    // Face should be in upper third — show oval guide
    left:   "50%",
    top:    "12%",
    width:  "42%",
    height: "30%",
    transform: "translateX(-50%)",
    border: `2px dashed ${facePos.detected ? "rgba(66,133,244,0.7)" : "rgba(255,255,255,0.25)"}`,
    borderRadius: "50%",
    pointerEvents: "none",
    zIndex: 9,
    transition: "border-color 0.3s ease",
  }), [facePos.detected]);

  return (
    <div className="camera-view" ref={containerRef}>
      {/* ── Flash overlay ── */}
      {flashActive && <div className="flash-overlay" />}

      {/* ── Camera container ── */}
      <div className="camera-container">

        {/* ── Video feed — always mirrored for selfie ── */}
        <video
          ref={videoRef}
          className="camera-video"
          autoPlay
          playsInline
          muted
          // Mirror the video so it feels like a selfie mirror
          style={{ transform: "scaleX(-1)" }}
        />

        {/* ── Jersey overlay — FIXED POSITION, always visible ── */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={overlayImgRef}
          src="/jersey-overlay.png"
          alt="GDG Noida Jersey Overlay"
          style={jerseyStyle}
          onLoad={() => setJerseyLoaded(true)}
          onError={() => {
            // Fallback to the full jersey image if overlay fails
            if (overlayImgRef.current) {
              overlayImgRef.current.src = "/jersey.jpeg.png";
            }
          }}
          // Prevent any dragging / interaction
          draggable={false}
        />

        {/* ── Face guide oval (UI hint only) ── */}
        {cameraState === "active" && <div style={faceGuideStyle} />}

        {/* ── Alignment guide text ── */}
        {cameraState === "active" && (
          <div className="alignment-hint">
            {facePos.detected
              ? "✓ Face detected — align your neck with the collar"
              : "Place your face above the collar"}
          </div>
        )}

        {/* ── Countdown display ── */}
        {cameraState === "countdown" && countdown > 0 && (
          <div className="countdown-display">{countdown}</div>
        )}

        {/* ── Requesting camera ── */}
        {cameraState === "requesting" && (
          <div className="camera-status">
            <div className="spinner" />
            <p>Requesting camera access…</p>
          </div>
        )}

        {/* ── Camera error ── */}
        {cameraState === "error" && (
          <div className="camera-status camera-error">
            <p>📷 Camera not available</p>
            <p className="error-detail">
              Please allow camera access and reload the page.
            </p>
            <button onClick={onBack} className="back-btn">
              ← Go Back
            </button>
          </div>
        )}
      </div>

      {/* ── Controls ── */}
      <div className="camera-controls">
        <button
          className="control-btn back-control"
          onClick={onBack}
          disabled={cameraState === "countdown"}
        >
          ← Back
        </button>

        <button
          className="shutter-btn"
          onClick={startCountdown}
          disabled={cameraState !== "active"}
        >
          {cameraState === "countdown" ? `${countdown}` : "📸"}
        </button>

        <div className="control-spacer" />
      </div>
    </div>
  );
};

export default CameraView;
