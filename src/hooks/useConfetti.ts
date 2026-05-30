"use client";

import { useCallback } from "react";

export function useConfetti() {
  const fire = useCallback(async () => {
    const confetti = (await import("canvas-confetti")).default;
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ["#4285F4", "#EA4335", "#FBBC04", "#34A853", "#ffffff"];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
        gravity: 0.8,
        scalar: 1.2,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
        gravity: 0.8,
        scalar: 1.2,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();

    // Big burst in center
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.5 },
      colors,
      scalar: 1.4,
    });
  }, []);

  return { fire };
}
