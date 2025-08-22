// src/components/AnalyticsBackground.tsx
import React from "react";

export default function AnalyticsBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        background:
          // deep base wash
          "rgba(12,12,25,0.75)," +
          // layered glows
          "radial-gradient(circle at 25% 35%, rgba(88,80,170,0.35) 0%, transparent 50%)," +
          "radial-gradient(circle at 70% 60%, rgba(180,110,255,0.2) 0%, transparent 65%)," +
          "radial-gradient(circle at 50% 80%, rgba(100,90,200,0.15) 0%, transparent 70%)",
        backgroundBlendMode: "overlay, overlay, overlay, normal",
      }}
    >
      <svg
        width="100%"
        height="100%"
        className="block pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ mixBlendMode: "overlay" }}
      >
        <defs>
          <filter id="noiseFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="2"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix
              in="noise"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 0.04 0"
            />
          </filter>

          <pattern
            id="dot-pattern"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="20" cy="20" r="1.5" fill="rgba(255,255,255,0.07)" />
            <circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.04)" />
            <circle cx="30" cy="10" r="1" fill="rgba(255,255,255,0.04)" />
            <circle cx="10" cy="30" r="1" fill="rgba(255,255,255,0.04)" />
            <circle cx="30" cy="30" r="1" fill="rgba(255,255,255,0.04)" />
          </pattern>
        </defs>

        {/* dots layer */}
        <rect
          width="100%"
          height="100%"
          fill="url(#dot-pattern)"
          style={{
            animation: "pulse-dots 15s ease-in-out infinite",
          }}
        />

        {/* noise overlay for texture */}
        <rect
          width="100%"
          height="100%"
          fill="transparent"
          filter="url(#noiseFilter)"
        />

        <style>{`
          @keyframes pulse-dots {
            0%,100% { opacity: 0.22; }
            50% { opacity: 0.18; }
          }
        `}</style>
      </svg>
    </div>
  );
}
