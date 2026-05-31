"use client";

import { motion } from "framer-motion";
import { GDGLogo, GDGColorBar } from "./GDGLogo";

interface WelcomeScreenProps {
  onStart: () => void;
  participantCount: number;
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] },
});

export function WelcomeScreen({ onStart, participantCount }: WelcomeScreenProps) {
  return (
    <div className="relative min-h-dvh grid-bg flex flex-col items-center justify-between px-5 py-10 overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gdg-blue/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gdg-green/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-gdg-red/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top section */}
      <div className="w-full flex flex-col items-center gap-6 mt-4">
        <motion.div {...fadeUp(0)}>
          <img
            src="/gdg-noida-logo.png"
            alt="GDG Noida"
            className="w-[280px] md:w-[340px] h-auto"
          />
        </motion.div>

        <GDGColorBar className="w-24" />
      </div>

      {/* Center section */}
      <div className="flex flex-col items-center gap-8 text-center">
        <motion.div {...fadeUp(0.1)}>
          {/* Jersey preview */}
          <div className="relative w-48 h-52 mx-auto mb-4">
            <div className="absolute inset-0 rounded-2xl bg-gdg-card border-gradient" />
            {/* Animated rings */}
            <div className="absolute inset-[-8px] rounded-3xl border border-gdg-blue/20 pulse-ring" />
            <div
              className="absolute inset-[-16px] rounded-3xl border border-gdg-blue/10 pulse-ring"
              style={{ animationDelay: "0.5s" }}
            />
            <img
              src="//jersey.jpeg.png"
              alt="GDG Noida Jersey"
              className="absolute inset-0 w-full h-full object-contain rounded-2xl p-3 animate-float"
            />
          </div>
        </motion.div>

        <motion.div {...fadeUp(0.2)} className="space-y-3">
          <h2 className="font-display font-900 text-4xl leading-none text-white">
            I Am{" "}
            <span className="gdg-text-gradient">GDG Noida</span>
          </h2>
          <p className="font-display text-lg text-white/60 tracking-wide">
            PHOTO BOOTH
          </p>
        </motion.div>

        <motion.div {...fadeUp(0.3)} className="flex items-center gap-4">
          {["LEARN", "BUILD", "CONNECT"].map((word, i) => (
            <div key={word} className="flex items-center gap-4">
              <span className="font-body text-sm font-600 tracking-widest text-white/70">
                {word}
              </span>
              {i < 2 && (
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: ["#4285F4", "#FBBC04", "#34A853"][i],
                    boxShadow: `0 0 6px ${["#4285F4", "#FBBC04", "#34A853"][i]}`,
                  }}
                />
              )}
            </div>
          ))}
        </motion.div>

        {/* Participant counter */}
        <motion.div {...fadeUp(0.35)}>
          <div className="border-gradient rounded-2xl px-6 py-3 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-gdg-green animate-pulse" />
            <span className="font-mono text-sm text-white/60">
              <span className="text-gdg-green font-700 text-base">{participantCount}</span>{" "}
              selfies taken today
            </span>
          </div>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <div className="w-full space-y-4">
        <motion.div {...fadeUp(0.4)}>
          <button
            onClick={onStart}
            className="w-full relative overflow-hidden rounded-2xl py-5 font-display font-800 text-xl text-white tracking-wide"
            style={{
              background: "linear-gradient(135deg, #4285F4 0%, #34A853 50%, #4285F4 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 3s linear infinite",
              boxShadow: "0 0 40px rgba(66,133,244,0.4), 0 8px 32px rgba(0,0,0,0.4)",
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              <span>📸</span>
              Start Photo Booth
            </span>
          </button>
        </motion.div>

        <motion.div {...fadeUp(0.5)}>
          <p className="text-center text-xs text-white/30 font-body">
            Camera access required • No photos are stored on servers
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div {...fadeUp(0.55)} className="grid grid-cols-4 gap-2 pt-2">
          {[
            { icon: "📷", label: "Allow Camera" },
            { icon: "👕", label: "Wear Jersey" },
            { icon: "🤳", label: "Take Selfie" },
            { icon: "📱", label: "Share Story" },
          ].map(({ icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-xl bg-gdg-card border border-gdg-border flex items-center justify-center text-lg">
                {icon}
              </div>
              <span className="text-[10px] text-white/40 text-center leading-tight font-body">
                {label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
