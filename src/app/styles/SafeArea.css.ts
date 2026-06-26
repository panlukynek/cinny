import { globalStyle } from '@vanilla-extract/css';
import { color } from 'folds';

/**
 * Mobile edge-to-edge support.
 *
 * Combined with `viewport-fit=cover` in `index.html`, this keeps the app out
 * from under device notches / rounded corners / the home indicator while still
 * painting those areas with the app background (so the inset region does not
 * show up as an out-of-place white/black bar). The `env()` insets resolve to
 * `0` on devices/desktops without safe areas, so this is a no-op there.
 *
 * Because an element paints its background under its own padding, padding
 * `body` (which carries the active theme's color variables) gives us a themed
 * inset region for free.
 */
globalStyle('body', {
  paddingTop: 'env(safe-area-inset-top)',
  paddingRight: 'env(safe-area-inset-right)',
  paddingBottom: 'env(safe-area-inset-bottom)',
  paddingLeft: 'env(safe-area-inset-left)',
  backgroundColor: color.Background.Container,
});
