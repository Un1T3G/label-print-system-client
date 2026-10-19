'use client';

import React from 'react';

export function QrCodeSvg({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 29 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 select-none"
    >
      <rect width="29" height="29" fill="white" />
      {/* Top-Left Finder */}
      <rect x="2" y="2" width="7" height="7" fill="black" />
      <rect x="3" y="3" width="5" height="5" fill="white" />
      <rect x="4" y="4" width="3" height="3" fill="black" />

      {/* Top-Right Finder */}
      <rect x="20" y="2" width="7" height="7" fill="black" />
      <rect x="21" y="3" width="5" height="5" fill="white" />
      <rect x="22" y="4" width="3" height="3" fill="black" />

      {/* Bottom-Left Finder */}
      <rect x="2" y="20" width="7" height="7" fill="black" />
      <rect x="3" y="21" width="5" height="5" fill="white" />
      <rect x="4" y="22" width="3" height="3" fill="black" />

      {/* Timing and alignment bars */}
      <line x1="5" y1="10" x2="5" y2="19" stroke="black" strokeWidth="1" strokeDasharray="1 1" />
      <line x1="10" y1="5" x2="19" y2="5" stroke="black" strokeWidth="1" strokeDasharray="1 1" />

      {/* Internal QR Data Cells */}
      <rect x="11" y="11" width="3" height="3" fill="black" />
      <rect x="15" y="11" width="2" height="2" fill="black" />
      <rect x="11" y="15" width="2" height="2" fill="black" />
      <rect x="14" y="14" width="3" height="3" fill="black" />
      <rect x="18" y="12" width="2" height="2" fill="black" />
      <rect x="11" y="19" width="3" height="2" fill="black" />
      <rect x="15" y="18" width="2" height="3" fill="black" />
      <rect x="20" y="11" width="2" height="2" fill="black" />
      <rect x="23" y="12" width="3" height="2" fill="black" />
      <rect x="20" y="15" width="4" height="2" fill="black" />
      <rect x="22" y="19" width="2" height="4" fill="black" />
      <rect x="18" y="22" width="3" height="2" fill="black" />
      <rect x="12" y="23" width="2" height="3" fill="black" />
      <rect x="15" y="23" width="2" height="2" fill="black" />
      <rect x="25" y="23" width="2" height="3" fill="black" />
    </svg>
  );
}
