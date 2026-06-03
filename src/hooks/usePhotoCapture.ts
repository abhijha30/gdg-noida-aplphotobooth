import { useCallback, useRef } from "react";

export interface JerseyLayout {
  x: number;       // px from left on the OUTPUT canvas
  y: number;       // px from top on the OUTPUT canvas
  width: number;   // px
  height: number;  // px
}

export interface CaptureResult {
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Computes the jersey layout for a given canvas size.
 *
 * Rules (mirroring CameraView's CSS overlay):
 *  - Jersey width = 92% of canvas width (matching CSS overlay width)
 *  - Aspect ratio preserved from the PNG (jerseyNatW / jerseyNatH)
 *  - Horizontally centred
 *  - Vertically: collar top sits at ~38% of canvas height
 *    so a user's neck lands in the collar during a selfie held at arm-length.
 */
export function computeJerseyLayout(
  canvasW: number,
  canvasH: number,
  jerseyNatW: number,
  jerseyNatH: number,
  faceX = 0.5,
  faceY = 0.22,
  faceW = 0.18,
  faceH = 0.18
): JerseyLayout {

  const faceWidthPx = faceW * canvasW;

  const jerseyW = faceWidthPx * 3.5;
  const jerseyH = jerseyW * (jerseyNatH / jerseyNatW);

  const faceCenterX = faceX * canvasW;

  const jerseyX = faceCenterX - jerseyW / 2;

  const jerseyY =
    (faceY * canvasH) +
    (faceH * canvasH * 0.8);

  return {
    x: jerseyX,
    y: jerseyY,
    width: jerseyW,
    height: jerseyH,
  };
}
export function usePhotoCapture(
  videoRef: React.RefObject<HTMLVideoElement>,
  overlayImageRef: React.RefObject<HTMLImageElement>,
  facePosition: {
    x: number;
    y: number;
    width: number;
    height: number;
  }
)
 {
  const captureCanvas = useRef<HTMLCanvasElement | null>(null);

  const capturePhoto = useCallback((): CaptureResult | null => {
    const video = videoRef.current;
    const jerseyImg = overlayImageRef.current;
    if (!video || !jerseyImg) return null;

    // Output canvas: 9:16 portrait
    const OUTPUT_W = 1080;
    const OUTPUT_H = 1920;

    if (!captureCanvas.current) {
      captureCanvas.current = document.createElement("canvas");
    }
    const canvas = captureCanvas.current;
    canvas.width = OUTPUT_W;
    canvas.height = OUTPUT_H;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // ── 1. Black background ──────────────────────────────────────────────
    ctx.fillStyle = "#0A0A0F";
    ctx.fillRect(0, 0, OUTPUT_W, OUTPUT_H);

    // ── 2. Draw mirrored video feed (selfie = front camera = mirrored) ──
    // Scale video to fill 9:16, cropping sides if needed (object-fit: cover)
    const vidW = video.videoWidth || 640;
    const vidH = video.videoHeight || 480;

    ctx.save();
    // Mirror horizontally (front-facing camera)
    ctx.translate(OUTPUT_W, 0);
    ctx.scale(-1, 1);

    const vidAspect = vidW / vidH;
    const outAspect = OUTPUT_W / OUTPUT_H;

    let sx = 0, sy = 0, sw = vidW, sh = vidH;
    if (vidAspect > outAspect) {
      // video is wider — crop sides
      sw = vidH * outAspect;
      sx = (vidW - sw) / 2;
    } else {
      // video is taller — crop top/bottom
      sh = vidW / outAspect;
      sy = (vidH - sh) / 2;
    }
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, OUTPUT_W, OUTPUT_H);
    ctx.restore();

    // ── 3. Draw jersey overlay at FIXED position ─────────────────────────
   const layout = computeJerseyLayout(
  OUTPUT_W,
  OUTPUT_H,
  jerseyImg.naturalWidth || jerseyImg.width,
  jerseyImg.naturalHeight || jerseyImg.height,
  facePosition.x,
  facePosition.y,
  facePosition.width,
  facePosition.height
);
    ctx.drawImage(jerseyImg, layout.x, layout.y, layout.width, layout.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    return { dataUrl, width: OUTPUT_W, height: OUTPUT_H };
  }, [videoRef, overlayImageRef]);

  return { capturePhoto };
}
