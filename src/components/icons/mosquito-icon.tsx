import * as React from "react";

export function MosquitoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      width="1em" // Default size to inherit font size
      height="1em" 
      {...props} // Pass other props like className, fill, etc.
    >
      {/* Group for the whole mosquito */}
      <g id="mosquito">
        {/* Wings (drawn first to be behind the body/legs) */}
        <g id="wings">
          <path 
            id="wing-upper" 
            fill="#ADD8E6" 
            fillOpacity="0.4" 
            stroke="#888" 
            strokeWidth="0.3" 
            d="M 50,40 Q 80,15 95,45 Q 75,55 50,40 Z" 
            transform="rotate(-10 50 40)" 
          />
          <path 
            id="wing-lower" 
            fill="#ADD8E6" 
            fillOpacity="0.35" 
            stroke="#888" 
            strokeWidth="0.3" 
            d="M 52,45 Q 82,20 97,50 Q 77,60 52,45 Z" 
            transform="rotate(-15 52 45)" 
          />
        </g>

        {/* Legs (drawn next) */}
        <g id="legs">
          {/* Front legs */}
          <polyline stroke="#333" strokeWidth="1" fill="none" points="48,55 40,70 45,85" />
          <polyline stroke="#333" strokeWidth="1" fill="none" points="46,56 37,73 42,88" />
          {/* Middle legs */}
          <polyline stroke="#333" strokeWidth="1" fill="none" points="55,58 55,78 65,90" />
          <polyline stroke="#333" strokeWidth="1" fill="none" points="53,59 52,80 62,92" />
          {/* Hind legs */}
          <polyline stroke="#333" strokeWidth="1" fill="none" points="60,56 75,70 85,75" />
          <polyline stroke="#333" strokeWidth="1" fill="none" points="58,57 72,73 82,78" />
        </g>

        {/* Body (Thorax and Abdomen) */}
        <g id="body">
          {/* Thorax (rounded part where legs/wings attach) */}
          <ellipse 
            id="thorax" 
            fill="#6F4E37" 
            stroke="#4a3524" 
            strokeWidth="0.5" 
            cx="50" cy="50" rx="12" ry="8" 
            transform="rotate(10 50 50)" 
          />
          {/* Abdomen (longer part) */}
          <path 
            id="abdomen" 
            fill="#6F4E37" 
            stroke="#4a3524" 
            strokeWidth="0.5" 
            d="M 60,48 Q 85,50 90,55 Q 80,65 62,58 Z" 
            transform="rotate(5 60 48)" 
          />
        </g>

        {/* Head area */}
        <g id="head-area">
          {/* Head */}
          <circle id="head" fill="#6F4E37" stroke="#4a3524" strokeWidth="0.5" cx="40" cy="45" r="6" />
          {/* Eye */}
          <circle id="eye" fill="#111" cx="38" cy="43" r="2" />
          {/* Proboscis (the 'stinger') */}
          <line id="proboscis" stroke="#222" strokeWidth="1.5" x1="40" y1="45" x2="15" y2="35" />
          {/* Antennae (simple lines) */}
          <line id="antenna1" x1="40" y1="45" x2="35" y2="30" stroke="#333" strokeWidth="0.5"/>
          <line id="antenna2" x1="40" y1="45" x2="42" y2="28" stroke="#333" strokeWidth="0.5"/>
        </g>
      </g>
    </svg>
  );
} 