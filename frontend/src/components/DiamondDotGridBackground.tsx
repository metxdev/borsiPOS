import React from "react";

export default function DiamondDotGridBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0 pointer-events-none"
    >
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Diamond-shaped dot pattern */}
          <pattern
            id="diamond-dot-grid"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <rect
              x="13"
              y="13"
              width="2"
              height="2"
              rx="1"
              ry="1"
              transform="rotate(45 14 14)"
              fill="rgba(255, 255, 255, 0.04)" 
            />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#diamond-dot-grid)" />
      </svg>
    </div>
  );
}
