import React from 'react';

export default function ShimmerEffect() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900"> {/* Generic dark background */}
      <svg
        width="100" // Reduced size for a more common loader appearance
        height="100"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Generic shimmering gradient (e.g., shades of gray or blue) */}
          <linearGradient id="shimmerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4A5568" stopOpacity="0.8"> {/* Darker gray */}
              <animate attributeName="stop-color" values="#4A5568;#718096;#4A5568" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#718096" stopOpacity="0.9"> {/* Lighter gray */}
               <animate attributeName="stop-color" values="#718096;#A0AEC0;#718096" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#4A5568" stopOpacity="0.7"> {/* Darker gray */}
              <animate attributeName="stop-color" values="#4A5568;#718096;#4A5568" dur="2s" repeatCount="indefinite" />
            </stop>
            {/* Animate the gradient position for a "sweeping" shimmer effect */}
            <animateTransform
              attributeName="gradientTransform"
              type="rotate"
              from="0 50 50"
              to="360 50 50"
              dur="3s"
              repeatCount="indefinite"
            />
          </linearGradient>

          {/* More subtle glow/blur for a generic look */}
          <filter id="subtleGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <circle
          cx="50"
          cy="50"
          r="40" // Adjusted radius for smaller size
          fill="none"
          stroke="url(#shimmerGradient)"
          strokeWidth="6" // Adjusted stroke width
          strokeLinecap="round"
          // Dash array and offset for a partial, animated circle
          strokeDasharray="120" // Approx. 2/3 of circumference (2*pi*r * 2/3)
          strokeDashoffset="120"
          filter="url(#subtleGlow)"
        >
          {/* Rotate the entire circle */}
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur="2s"
            repeatCount="indefinite"
          />
          {/* Animate the dash offset to create the "drawing" effect */}
          <animate
            attributeName="strokeDashoffset"
            values="120;0;120"
            dur="1.5s"
            repeatCount="indefinite"
          />
          {/* Subtle opacity animation */}
          <animate
            attributeName="opacity"
            values="0.8;1;0.8"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
}