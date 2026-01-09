import React from 'react';

// Azmera branded backend icon (simple SVG) — used as the generic backend logo in the UI.
export const BackendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Azmera backend logo" {...props}>
    <title>Azmera</title>
    <g fill="none" fillRule="evenodd">
      <circle cx="20" cy="20" r="18" fill="#F28C3A" />
      <path d="M20 10c-3 4-6 7-6 10 0 4 4 6 6 6s6-2 6-6c0-3-3-6-6-10z" fill="#073B3A" />
      <text x="44" y="25" fontFamily="Inter, Arial, sans-serif" fontSize="16" fill="#073B3A">Azmera</text>
    </g>
  </svg>
);

export default BackendIcon;
