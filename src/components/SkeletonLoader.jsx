import React from 'react';

export function SkeletonBox({ width = '100%', height = '20px', borderRadius = '8px', style = {} }) {
  return (
    <div
      className="skeleton-pulse"
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
    />
  );
}

export function SkeletonHeader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid var(--hairline)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <SkeletonBox width="34px" height="34px" borderRadius="10px" />
        <SkeletonBox width="90px" height="22px" />
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <SkeletonBox width="80px" height="30px" borderRadius="18px" />
        <SkeletonBox width="30px" height="30px" borderRadius="50%" />
      </div>
    </div>
  );
}

export function SkeletonHeroCard() {
  return (
    <div
      style={{
        background: 'var(--bg-hero)',
        border: '1px solid var(--bg-hero-border)',
        borderRadius: '16px',
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <SkeletonBox width="140px" height="20px" />
        <SkeletonBox width="60px" height="14px" />
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '6px' }}>
        <SkeletonBox width="180px" height="46px" borderRadius="10px" />
        <SkeletonBox width="80px" height="18px" />
      </div>
      <SkeletonBox width="100%" height="6px" borderRadius="3px" />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <SkeletonBox width="90px" height="14px" />
        <SkeletonBox width="110px" height="14px" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 4 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            background: 'var(--bg-card)',
            border: '1px solid var(--bg-card-border)',
            borderRadius: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <SkeletonBox width="38px" height="38px" borderRadius="12px" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              <SkeletonBox width="60%" height="16px" />
              <SkeletonBox width="40%" height="12px" />
            </div>
          </div>
          <SkeletonBox width="64px" height="20px" />
        </div>
      ))}
    </div>
  );
}

export default function SkeletonScreen() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', width: '100%' }}>
      <SkeletonHeroCard />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SkeletonBox width="70px" height="12px" />
          <SkeletonBox width="90px" height="26px" />
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SkeletonBox width="70px" height="12px" />
          <SkeletonBox width="90px" height="26px" />
        </div>
      </div>
      <div style={{ marginTop: '8px' }}>
        <SkeletonBox width="100px" height="20px" style={{ marginBottom: '12px' }} />
        <SkeletonList count={3} />
      </div>
    </div>
  );
}
