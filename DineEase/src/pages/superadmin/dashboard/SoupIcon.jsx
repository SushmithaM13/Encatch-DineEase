import React from "react";

// SoupIcon.jsx
// A reusable React component that renders the gradient rounded-square background
// and the white line-drawn bowl + spoon icon as an inline SVG. Props allow
// control of size, stroke width and additional classes.

export default function SoupIcon({
  size = 64,
  strokeWidth = 32,
  className = "",
  ariaLabel = "soup icon",
  title = "Soup Icon",
  ...props
}) {
  const stroke = "#FFFFFF";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      role="img"
      aria-label={ariaLabel}
      className={className}
      {...props}
    >
      <title>{title}</title>

      {/* Rounded gradient background */}
      <defs>
        <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#2E6DF6" />
          <stop offset="100%" stopColor="#B04CF0" />
        </linearGradient>
      </defs>

      <rect
        x="16"
        y="16"
        width="992"
        height="992"
        rx="192"
        ry="192"
        fill="url(#g1)"
      />

      {/* Bowl + spoon strokes (scaled to fit) */}
      <g
        transform="translate(64,96) scale(0.8)"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Steam */}
        <path d="M384 152c18 26 18 52 0 78" transform="translate(32,0)" />
        <path d="M464 152c18 26 18 52 0 78" transform="translate(32,0)" />

        {/* Spoon (over bowl) */}
        <path d="M832 256c-120 32-320 232-480 232-48 0-96-8-128-24" />
        <path d="M688 144c56-8 176-8 224 0-96 56-176 120-264 224-40 48-96 104-176 144" />

        {/* Bowl rim */}
        <path d="M176 416c0-40 200-72 368-72s368 32 368 72-168 296-368 296S176 456 176 416z" />

        {/* Bowl base small foot */}
        <path d="M416 792c40 36 176 36 216 0" />
      </g>
    </svg>
  );
}
