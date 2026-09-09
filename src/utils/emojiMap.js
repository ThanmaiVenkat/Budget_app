// Maps every emoji this app actually uses to its local Twitter/Twemoji-style
// PNG in public/emoji/ — filenames are the emoji's Unicode codepoints,
// hyphen-joined, matching the convention used by the Twemoji asset set. Kept
// as an explicit lookup rather than computed at runtime: a couple of these
// (variation-selector and ZWJ sequences) don't round-trip through a generic
// "codepoint to filename" formula without hand-checking against the actual
// files on disk, which was already done once when these were chosen — redoing
// it in a runtime function would just be reintroducing that same risk with
// every build.
export const EMOJI_MAP = {
  '⚠️': '26a0-fe0f',
  '⚡': '26a1',
  '🌴': '1f334',
  '🍽️': '1f37d-fe0f',
  '🎮': '1f3ae',
  '🎯': '1f3af',
  '🏠': '1f3e0',
  '🏥': '1f3e5',
  '🏦': '1f3e6',
  '🐶': '1f436',
  '👤': '1f464',
  '👦': '1f466',
  '👧': '1f467',
  '👨‍👩‍👧‍👦': '1f468-200d-1f469-200d-1f467-200d-1f466',
  '👨‍💻': '1f468-200d-1f4bb',
  '👩‍💼': '1f469-200d-1f4bc',
  '👴': '1f474',
  '👵': '1f475',
  '💰': '1f4b0',
  '💳': '1f4b3',
  '💵': '1f4b5',
  '💸': '1f4b8',
  '📅': '1f4c5',
  '📈': '1f4c8',
  '📚': '1f4da',
  '📦': '1f4e6',
  '📱': '1f4f1',
  '🚀': '1f680',
  '🚗': '1f697',
  '🛍️': '1f6cd-fe0f',
  '🛒': '1f6d2',
  '🛡️': '1f6e1-fe0f',
  '🧒': '1f9d2',
  '🧾': '1f9fe'
};

export const emojiUrl = (char) => {
  const codepoints = EMOJI_MAP[char];
  return codepoints ? `${import.meta.env.BASE_URL}emoji/${codepoints}.png` : null;
};
