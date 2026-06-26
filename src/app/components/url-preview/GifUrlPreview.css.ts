import { style } from '@vanilla-extract/css';
import { DefaultReset, color, config, toRem } from 'folds';

// Largest size a GIF will occupy in the timeline. It still shrinks to
// `100%` on narrow (mobile) screens via `max-width`.
export const GIF_MAX_WIDTH = 360;
export const GIF_MAX_HEIGHT = 400;

export const GifPreview = style([
  DefaultReset,
  {
    position: 'relative',
    display: 'block',
    maxWidth: '100%',
    width: toRem(GIF_MAX_WIDTH),
    backgroundColor: color.SurfaceVariant.Container,
    border: `${config.borderWidth.B300} solid ${color.SurfaceVariant.ContainerLine}`,
    borderRadius: config.radii.R300,
    overflow: 'hidden',
  },
]);

export const GifPreviewImg = style([
  DefaultReset,
  {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    cursor: 'pointer',
  },
]);

export const GifOverlay = style([
  DefaultReset,
  {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: 'none',
    backgroundColor: 'transparent',
  },
]);

export const GifBadge = style([
  DefaultReset,
  {
    position: 'absolute',
    bottom: config.space.S100,
    left: config.space.S100,
    padding: `0 ${config.space.S100}`,
    borderRadius: config.radii.R300,
    backgroundColor: color.Background.Container,
    color: color.Background.OnContainer,
    pointerEvents: 'none',
    userSelect: 'none',
  },
]);
