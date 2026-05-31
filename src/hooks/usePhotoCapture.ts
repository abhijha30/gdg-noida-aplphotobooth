"use client";

import { useCallback, useRef, useState } from "react";
import { JerseyPosition } from "./useFaceDetection";

export interface CapturedPhoto {
  dataUrl: string;
  timestamp: number;
}

interface UsePhotoCaptureReturn {
  capturedPhoto: CapturedPhoto | null;
  isCapturing: boolean;
  capturePhoto: (
    video: HTMLVideoElement,
    jerseyImg: HTMLImageElement | null,
    jerseyPosition: JerseyPosition | null
  ) => Promise<void>;
  downloadPhoto: () => void;
  shareToInstagram: () => void;
  resetPhoto: () => void;
}

const GDG_COLORS = ["#4285F4", "#EA4335", "#FBBC04", "#34A853"];

function drawBrandingOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  // Top gradient bar
  const topGrad = ctx.createLinearGradient(0, 0, width, 0);
  topGrad.addColorStop(0,    "rgba(66,133,244,0.9)");
  topGrad.addColorStop(0.33, "rgba(234,67,53,0.9)");
  topGrad.addColorStop(0.66, "rgba(251,188,4,0.9)");
  topGrad.addColorStop(1,    "rgba(52,168,83,0.9)");
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, width, 6);

  // Bottom branding panel
  const panelH = Math.round(height * 0.13);
  const panelGrad = ctx.createLinearGradient(0, height - panelH, 0, height);
  panelGrad.addColorStop(0,   "rgba(10,10,15,0)");
  panelGrad.addColorStop(0.3, "rgba(10,10,15,0.85)");
  panelGrad.addColorStop(1,   "rgba(10,10,15,0.97)");
  ctx.fillStyle = panelGrad;
  ctx.fillRect(0, height - panelH, width, panelH);

  // Bottom colour bar
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, height - 6, width, 6);

  // GDG Noida text
  const fontSize = Math.round(width * 0.065);
  ctx.font = `900 ${fontSize}px 'Exo 2', sans-serif`;
  ctx.textAlign    = "left";
  ctx.textBaseline = "bottom";
  ctx.fillStyle    = "white";
  ctx.shadowColor  = "rgba(66,133,244,0.8)";
  ctx.shadowBlur   = 15;
  ctx.fillText("GDG Noida", Math.round(width * 0.05), height - Math.round(panelH * 0.42));
  ctx.shadowBlur = 0;

  // Tagline
  const tagSize = Math.round(fontSize * 0.38);
  ctx.font      = `500 ${tagSize}px 'DM Sans', sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText("LEARN  •  BUILD  •  CONNECT", Math.round(width * 0.05), height - Math.round(panelH * 0.12));

  // Hashtag on right
  const tagFontSize = Math.round(fontSize * 0.5);
  ctx.font      = `700 ${tagFontSize}px 'Exo 2', sans-serif`;
  ctx.textAlign = "right";
  ctx.fillStyle = "#4285F4";
  ctx.fillText("#IAmGDGNoida", width - Math.round(width * 0.04), height - Math.round(panelH * 0.42));

  ctx.font      = `400 ${Math.round(tagFontSize * 0.75)}px 'DM Sans', sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillText("@gdgnoida", width - Math.round(width * 0.04), height - Math.round(panelH * 0.12));

  // Corner GDG logo dots
  const dotR   = Math.round(width * 0.016);
  const startX = Math.round(width * 0.05);
  const dotY   = Math.round(height * 0.05);
  const gap    = dotR * 2.5;
  GDG_COLORS.forEach((color, i) => {
    ctx.beginPath();
    ctx.arc(startX + i * gap, dotY, dotR, 0, Math.PI * 2);
    ctx.fillStyle   = color;
    ctx.shadowColor = color;
    ctx.shadowBlur  = 10;
    ctx.fill();
    ctx.shadowBlur  = 0;
  });
}

export function usePhotoCapture(): UsePhotoCaptureReturn {
  const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(null);
  const [isCapturing,   setIsCapturing]   = useState(false);

  const capturePhoto = useCallback(
    async (
      video: HTMLVideoElement,
      jerseyImg: HTMLImageElement | null,
      jerseyPosition: JerseyPosition | null
    ) => {
      setIsCapturing(true);

      try {
        const vw = video.videoWidth  || 640;
        const vh = video.videoHeight || 480;

        const canvas = document.createElement("canvas");
        canvas.width  = vw;
        canvas.height = vh;
        const ctx = canvas.getContext("2d")!;

        // ── Step 1: draw the mirrored video frame ──────────────────────────────
        ctx.save();
        ctx.translate(vw, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, vw, vh);
        ctx.restore();

        // ── Step 2: draw the jersey at the SAME visual position as preview ─────
        if (jerseyImg && jerseyPosition) {
          // ─── BUG FIX #5 (THE MAIN CAPTURE BUG) ──────────────────────────────
          //
          // jerseyPosition.{x,y,width,height} are in *display-canvas* pixels
          // (the size of the overlay canvas shown in the browser, e.g. 390×700).
          //
          // The capture canvas is in *video* pixels (e.g. 1280×720).
          //
          // The old code did:
          //   mirroredX = vw - jerseyPosition.x - jerseyPosition.width
          // which re-mirrors an already-mirrored x value and uses display-pixel
          // coords directly on a video-resolution canvas → completely wrong.
          //
          // The fix: scale the display-canvas coords to video-canvas coords using
          // the ratio stored in jerseyPosition.canvasW / canvasH.
          // The jersey x is already in mirrored (display) space; we just need to
          // rescale it, NOT re-mirror it again.
          // ─────────────────────────────────────────────────────────────────────

          const scaleX = vw / (jerseyPosition.canvasW || vw);
          const scaleY = vh / (jerseyPosition.canvasH || vh);

          // Use the average scale to keep the jersey proportional
          const scale = (scaleX + scaleY) / 2;

          const jx = jerseyPosition.x      * scaleX;
          const jy = jerseyPosition.y      * scaleY;
          const jw = jerseyPosition.width  * scale;
          const jh = jerseyPosition.height * scale;

          ctx.globalAlpha = jerseyPosition.opacity;
          ctx.drawImage(jerseyImg, jx, jy, jw, jh);
          ctx.globalAlpha = 1;

        } else if (jerseyImg) {
          // Fallback: centre jersey if no face detected
          const jw = vw * 0.78;
          const jh = jw * 1.35;
          const jx = (vw - jw) / 2;
          const jy = vh * 0.28;
          ctx.globalAlpha = 0.92;
          ctx.drawImage(jerseyImg, jx, jy, jw, jh);
          ctx.globalAlpha = 1;
        }

        // ── Step 3: branding overlay ───────────────────────────────────────────
        drawBrandingOverlay(ctx, vw, vh);

        const dataUrl = canvas.toDataURL("image/png", 0.95);
        setCapturedPhoto({ dataUrl, timestamp: Date.now() });
      } finally {
        setIsCapturing(false);
      }
    },
    []
  );

  const downloadPhoto = useCallback(() => {
    if (!capturedPhoto) return;
    const link = document.createElement("a");
    link.href      = capturedPhoto.dataUrl;
    link.download  = `GDGNoida-${capturedPhoto.timestamp}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [capturedPhoto]);

  const shareToInstagram = useCallback(() => {
    if (!capturedPhoto) return;
    downloadPhoto();
    setTimeout(() => {
      window.location.href = "instagram://story-camera";
      setTimeout(() => {
        window.open("https://www.instagram.com", "_blank");
      }, 1500);
    }, 500);
  }, [capturedPhoto, downloadPhoto]);

  const resetPhoto = useCallback(() => {
    setCapturedPhoto(null);
  }, []);

  return {
    capturedPhoto,
    isCapturing,
    capturePhoto,
    downloadPhoto,
    shareToInstagram,
    resetPhoto,
  };
}
