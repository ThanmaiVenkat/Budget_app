import React from 'react';

// The app's brand mark — a tally-counting group (four strokes + a slash),
// matching the PWA icon in public/icons/. Uses currentColor so it inherits
// whatever text color its container sets.
export default function TallyMark({ size = 18, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" style={style}>
      <g stroke="currentColor" strokeLinecap="round">
        <line x1="184" y1="161" x2="184" y2="351" strokeWidth="42" />
        <line x1="232" y1="161" x2="232" y2="351" strokeWidth="42" />
        <line x1="280" y1="161" x2="280" y2="351" strokeWidth="42" />
        <line x1="328" y1="161" x2="328" y2="351" strokeWidth="42" />
        <line x1="156" y1="351" x2="356" y2="161" strokeWidth="46" />
      </g>
    </svg>
  );
}
