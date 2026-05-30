"use client";

import { motion } from "framer-motion";

interface CameraErrorProps {
  message: string;
  onRetry: () => void;
  onBack: () => void;
}

export function CameraError({ message, onRetry, onBack }: CameraErrorProps) {
  return (
    <div className="min-h-dvh grid-bg flex flex-col items-center justify-center px-6 gap-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm text-center space-y-6"
      >
        <div className="w-20 h-20 rounded-2xl bg-gdg-red/20 border border-gdg-red/40 flex items-center justify-center text-4xl mx-auto">
          📷
        </div>
        <div className="space-y-2">
          <h2 className="font-display font-800 text-xl text-white">Camera Access Needed</h2>
          <p className="text-white/50 text-sm leading-relaxed">{message}</p>
        </div>

        {/* Browser-specific help */}
        <div className="border-gradient rounded-2xl p-4 text-left space-y-2">
          <p className="text-white/70 text-xs font-display font-700 mb-2">How to allow camera:</p>
          {[
            { icon: "🤖", label: "Chrome Android", step: "Tap the lock icon → Site settings → Camera → Allow" },
            { icon: "🍎", label: "Safari iPhone", step: "Settings app → Safari → Camera → Allow" },
          ].map(({ icon, label, step }) => (
            <div key={label} className="flex gap-2">
              <span>{icon}</span>
              <div>
                <p className="text-xs font-700 font-display text-white/60">{label}</p>
                <p className="text-[11px] text-white/40">{step}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onRetry}
            className="w-full py-4 rounded-2xl font-display font-800 text-base text-white"
            style={{
              background: "linear-gradient(135deg, #4285F4, #34A853)",
              boxShadow: "0 8px 30px rgba(66,133,244,0.35)",
            }}
          >
            Try Again
          </button>
          <button onClick={onBack} className="text-white/40 text-sm font-body py-2">
            ← Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
