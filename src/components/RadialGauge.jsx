import React from 'react';

/**
 * Animated SVG Radial Gauge for budgets.
 * Changes color dynamically:
 * - Green/Accent: <80%
 * - Amber/Gold: 80% - 99%
 * - Crimson/Danger: >=100% (with optional pulse)
 */
export default function RadialGauge({
  percent = 0,
  size = 46,
  strokeWidth = 4.5,
  accentColor = 'var(--accent)',
  showLabel = true,
  labelSize = '0.68rem',
  sublabel = ''
}) {
  const normalizedPercent = Math.max(0, Math.min(100, Math.round(percent)));
  const isOver = percent > 100;
  const isWarning = percent >= 80 && percent <= 100;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(percent, 100) / 100) * circumference;

  let ringColor = accentColor;
  if (isOver) ringColor = 'var(--danger)';
  else if (isWarning) ringColor = 'var(--gold)';

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}
      className={isOver ? 'pulsate-overrun' : ''}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background circle track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--track)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{ transition: 'stroke-dashoffset 0.6s var(--ease-out), stroke 0.3s ease' }}
        />
      </svg>

      {showLabel && (
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: labelSize,
              fontWeight: '800',
              color: isOver ? 'var(--danger)' : isWarning ? 'var(--gold)' : 'var(--text-main)',
              lineHeight: 1
            }}
          >
            {isOver ? '! 100%+' : `${normalizedPercent}%`}
          </span>
          {sublabel && (
            <span style={{ fontSize: '0.55rem', color: 'var(--text-dim)', lineHeight: 1, marginTop: '1px' }}>
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
