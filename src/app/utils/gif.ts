/**
 * Detect links that should be rendered as inline, auto-playing animated
 * media (à la Discord) instead of a plain link-preview card.
 *
 * We match the popular GIF providers (Tenor, Giphy, ...) as well as direct
 * links to animated files. The actual media is still resolved and proxied
 * through the homeserver's URL-preview (`og:image`), so this does not leak
 * the user's IP to the third party.
 */

// Host suffixes that (almost) always serve animated GIF content.
const GIF_HOST_REG = /(?:^|\.)(tenor\.com|giphy\.com|gph\.is|gfycat\.com|redgifs\.com)$/i;

// Direct links to animated media files.
const GIF_PATH_REG = /\.(gif|gifv|apng)(?:$|[?#])/i;

export const isGifUrl = (url: string): boolean => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
  if (GIF_HOST_REG.test(parsed.hostname)) return true;
  if (GIF_PATH_REG.test(parsed.pathname)) return true;
  return false;
};
