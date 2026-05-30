"use client";

import { motion } from "framer-motion";
import { CapturedPhoto } from "@/hooks/usePhotoCapture";
import { GDGColorBar } from "./GDGLogo";

interface PhotoResultProps {
  photo: CapturedPhoto;
  onDownload: () => void;
  onShare: () => void;
  onRetake: () => void;
}

export function PhotoResult({ photo, onDownload, onShare, onRetake }: PhotoResultProps) {
  return (
    <div className="min-h-dvh grid-bg flex flex-col items-center justify-between px-5 py-8 overflow-hidden">
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gdg-green/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-2 w-full"
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-2xl">🎉</span>
          <h2 className="font-display font-900 text-2xl text-white">
            Looking <span className="gdg-text-gradient">GDG!</span>
          </h2>
          <span className="text-2xl">🎉</span>
        </div>
        <GDGColorBar className="w-20 mx-auto" />
      </motion.div>

      {/* Photo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm mx-auto"
      >
        {/* Glow rings */}
        <div className="absolute inset-[-6px] rounded-3xl bg-gdg-gradient opacity-40 blur-md" />
        <div className="relative rounded-2xl overflow-hidden border-gradient shadow-2xl">
          <img
            src={photo.dataUrl}
            alt="Your GDG Noida selfie"
            className="w-full block"
            style={{ maxHeight: "55vh", objectFit: "cover" }}
          />
        </div>
      </motion.div>

      {/* Instagram instructions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="w-full max-w-sm space-y-3"
      >
        {/* Instagram share card */}
        <div className="border-gradient rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-base"
              style={{
                background:
                  "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
              }}
            >
              📸
            </div>
            <div>
              <p className="font-display font-700 text-sm text-white">Post to Instagram Story</p>
              <p className="text-xs text-white/40">Tag @gdgnoida • Enter swag giveaway!</p>
            </div>
          </div>
          <div className="space-y-1.5 pl-1">
            {[
              "Download your photo",
              "Open Instagram → Story",
              "Upload this photo",
              "Tag @gdgnoida",
              "Show story to volunteers ✅",
            ].map((step, i) => (
              <div key={step} className="flex items-center gap-2.5">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-900 font-display text-white flex-shrink-0"
                  style={{ background: ["#4285F4", "#EA4335", "#FBBC04", "#34A853", "#4285F4"][i] }}
                >
                  {i + 1}
                </div>
                <p className="text-xs text-white/60">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <button
          onClick={onShare}
          className="w-full py-4 rounded-2xl font-display font-800 text-lg text-white flex items-center justify-center gap-3"
          style={{
            background:
              "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
            boxShadow: "0 8px 30px rgba(220,39,67,0.35)",
          }}
        >
          <span>📸</span>
          Post on Instagram Story
        </button>

        <button
          onClick={onDownload}
          className="w-full py-4 rounded-2xl font-display font-700 text-base text-white flex items-center justify-center gap-2 border-gradient"
          style={{ background: "rgba(66,133,244,0.1)" }}
        >
          <span>⬇️</span>
          Save Photo
        </button>

        <button
          onClick={onRetake}
          className="w-full py-3 text-sm text-white/40 font-body hover:text-white/60 transition-colors"
        >
          ↩ Retake photo
        </button>
      </motion.div>
    </div>
  );
}
