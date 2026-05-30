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

function drawGDGLogo(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  // Draw GDG-style code icon (< >)
  ctx.font = `bold ${size}px 'Exo 2', sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Left bracket
  const gradient = ctx.createLinearGradient(x - size, y, x + size, y);
  gradient.addColorStop(0, "#4285F4");
  gradient.addColorStop(0.33, "#EA4335");
  gradient.addColorStop(0.66, "#FBBC04");
  gradient.addColorStop(1, "#34A853");

  ctx.fillStyle = "#4285F4";
  ctx.fillText("<", x - size * 0.5, y);
  ctx.fillStyle = "#34A853";
  ctx.fillText(">", x + size * 0.5, y);
}

function drawBrandingOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const dpr = 1;
  void dpr;

  // Top gradient bar
  const topGrad = ctx.createLinearGradient(0, 0, width, 0);
  topGrad.addColorStop(0, "rgba(66,133,244,0.9)");
  topGrad.addColorStop(0.33, "rgba(234,67,53,0.9)");
  topGrad.addColorStop(0.66, "rgba(251,188,4,0.9)");
  topGrad.addColorStop(1, "rgba(52,168,83,0.9)");
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, width, 6);

  // Bottom branding panel
  const panelH = Math.round(height * 0.13);
  const panelGrad = ctx.createLinearGradient(0, height - panelH, 0, height);
  panelGrad.addColorStop(0, "rgba(10,10,15,0)");
  panelGrad.addColorStop(0.3, "rgba(10,10,15,0.85)");
  panelGrad.addColorStop(1, "rgba(10,10,15,0.97)");
  ctx.fillStyle = panelGrad;
  ctx.fillRect(0, height - panelH, width, panelH);

  // Bottom color bar
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, height - 6, width, 6);

  // GDG Noida text
  const fontSize = Math.round(width * 0.065);
  ctx.font = `900 ${fontSize}px 'Exo 2', sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.fillStyle = "white";
  ctx.shadowColor = "rgba(66,133,244,0.8)";
  ctx.shadowBlur = 15;
  ctx.fillText("GDG Noida", Math.round(width * 0.05), height - Math.round(panelH * 0.42));
  ctx.shadowBlur = 0;

  // Tagline
  const tagSize = Math.round(fontSize * 0.38);
  ctx.font = `500 ${tagSize}px 'DM Sans', sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText(
    "LEARN  •  BUILD  •  CONNECT",
    Math.round(width * 0.05),
    height - Math.round(panelH * 0.12)
  );

  // Hashtag on right
  const tagFontSize = Math.round(fontSize * 0.5);
  ctx.font = `700 ${tagFontSize}px 'Exo 2', sans-serif`;
  ctx.textAlign = "right";
  ctx.fillStyle = "#4285F4";
  ctx.fillText("#IAmGDGNoida", width - Math.round(width * 0.04), height - Math.round(panelH * 0.42));

  // @gdgnoida
  ctx.font = `400 ${Math.round(tagFontSize * 0.75)}px 'DM Sans', sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillText("@gdgnoida", width - Math.round(width * 0.04), height - Math.round(panelH * 0.12));

  // Corner GDG logo dots
  const dotR = Math.round(width * 0.016);
  const colors = GDG_COLORS;
  const startX = Math.round(width * 0.05);
  const dotY = Math.round(height * 0.05);
  const gap = dotR * 2.5;
  colors.forEach((color, i) => {
    ctx.beginPath();
    ctx.arc(startX + i * gap, dotY, dotR, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}

export function usePhotoCapture(): UsePhotoCaptureReturn {
  const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const capturePhoto = useCallback(
    async (
      video: HTMLVideoElement,
      jerseyImg: HTMLImageElement | null,
      jerseyPosition: JerseyPosition | null
    ) => {
      setIsCapturing(true);

      try {
        const vw = video.videoWidth || 640;
        const vh = video.videoHeight || 480;

        const canvas = document.createElement("canvas");
        canvas.width = vw;
        canvas.height = vh;
        const ctx = canvas.getContext("2d")!;

        // Mirror the video (selfie = mirrored)
        ctx.save();
        ctx.translate(vw, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, vw, vh);
        ctx.restore();

        // Draw jersey overlay if we have position
        if (jerseyImg && jerseyPosition) {
          // Adjust for mirror: flip x position
          const mirroredX = vw - jerseyPosition.x - jerseyPosition.width;
          ctx.globalAlpha = jerseyPosition.opacity;
          ctx.drawImage(
            jerseyImg,
            mirroredX,
            jerseyPosition.y,
            jerseyPosition.width,
            jerseyPosition.height
          );
          ctx.globalAlpha = 1;
        } else if (jerseyImg) {
          // Fallback: center jersey if no face detected
          const jw = vw * 0.78;
          const jh = jw * 1.1;
          const jx = (vw - jw) / 2;
          const jy = vh * 0.32;
          ctx.globalAlpha = 0.92;
          ctx.drawImage(jerseyImg, jx, jy, jw, jh);
          ctx.globalAlpha = 1;
        }

        // Draw branding overlay on top
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
    link.href = capturedPhoto.dataUrl;
    link.download = `GDGNoida-${capturedPhoto.timestamp}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [capturedPhoto]);

  const shareToInstagram = useCallback(() => {
    if (!capturedPhoto) return;
    // Download first (Instagram doesn't accept direct programmatic uploads)
    downloadPhoto();
    // Then open Instagram app
    setTimeout(() => {
      // Try Instagram story intent (works on mobile apps)
      const instagramUrl = "instagram://story-camera";
      window.location.href = instagramUrl;
      // Fallback to instagram.com
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
