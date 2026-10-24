import React, { useState } from 'react';
import { emojiUrl } from '../utils/emojiMap';

// Renders one of this app's emoji as a colourful Twitter/Twemoji-style image
// (public/emoji/) instead of a native glyph, so it looks the same on every
// platform — Android's system emoji in particular reads noticeably
// flatter/less detailed than iOS's, which was the actual complaint this
// solves. Falls back to the raw character — as plain text, alt intact — if
// the image fails to load, or if it's an emoji outside EMOJI_MAP (e.g. a
// payment-method glyph picked from a native <select>, where that's a minor
// cosmetic gap rather than a broken render).
export default function Emoji({ children, size = '1em', style }) {
  const [failed, setFailed] = useState(false);
  const url = !failed ? emojiUrl(children) : null;

  if (!url) return <>{children}</>;

  return (
    <img
      src={url}
      alt={children}
      onError={() => setFailed(true)}
      draggable={false}
      style={{ width: size, height: size, display: 'inline-block', verticalAlign: '-0.15em', ...style }}
    />
  );
}
