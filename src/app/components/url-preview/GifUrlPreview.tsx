/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { IPreviewUrlResponse } from 'matrix-js-sdk';
import { Box, Icon, Icons, Spinner, Text, as, toRem } from 'folds';
import classNames from 'classnames';
import { ImageOverlay } from '../ImageOverlay';
import { ImageViewer } from '../image-viewer';
import { AsyncStatus, useAsyncCallback } from '../../hooks/useAsyncCallback';
import { useMatrixClient } from '../../hooks/useMatrixClient';
import { useMediaAuthentication } from '../../hooks/useMediaAuthentication';
import { mxcUrlToHttp } from '../../utils/matrix';
import { onEnterOrSpace } from '../../utils/keyboard';
import { UrlPreviewCard } from './UrlPreviewCard';
import * as css from './GifUrlPreview.css';

const getDisplaySize = (
  width: number | undefined,
  height: number | undefined
): { width: number; aspectRatio?: string } => {
  if (!width || !height) {
    return { width: css.GIF_MAX_WIDTH };
  }
  const ratio = width / height;
  let dispW = Math.min(width, css.GIF_MAX_WIDTH);
  let dispH = dispW / ratio;
  if (dispH > css.GIF_MAX_HEIGHT) {
    dispH = css.GIF_MAX_HEIGHT;
    dispW = dispH * ratio;
  }
  return { width: dispW, aspectRatio: `${width} / ${height}` };
};

/**
 * Renders a GIF/animated link (Tenor, Giphy, direct `.gif`, ...) inline as
 * auto-playing media, like Discord. The animated image is served (and
 * proxied) by the homeserver via the URL-preview `og:image`, so requesting it
 * without thumbnail dimensions returns the original — animated — file.
 *
 * Falls back to the regular `UrlPreviewCard` when the homeserver does not
 * return a usable image for the link.
 */
export const GifUrlPreview = as<'div', { url: string; ts: number; autoPlay?: boolean }>(
  ({ url, ts, autoPlay, className, ...props }, ref) => {
    const mx = useMatrixClient();
    const useAuthentication = useMediaAuthentication();
    const [play, setPlay] = useState(autoPlay ?? true);
    const [loaded, setLoaded] = useState(false);
    const [viewer, setViewer] = useState(false);

    const [previewState, loadPreview] = useAsyncCallback<IPreviewUrlResponse, unknown, []>(
      useCallback(() => mx.getUrlPreview(url, ts), [url, ts, mx])
    );

    useEffect(() => {
      loadPreview();
    }, [loadPreview]);

    const preview = previewState.status === AsyncStatus.Success ? previewState.data : undefined;
    const imageMxc = preview?.['og:image'];

    // Original (animated) media — no width/height so the homeserver serves
    // the full file instead of a static thumbnail.
    const fullUrl = useMemo(
      () => (imageMxc ? mxcUrlToHttp(mx, imageMxc, useAuthentication) : null),
      [mx, imageMxc, useAuthentication]
    );
    // Scaled, static first-frame used as the click-to-play placeholder.
    const thumbUrl = useMemo(
      () =>
        imageMxc ? mxcUrlToHttp(mx, imageMxc, useAuthentication, 360, 360, 'scale', false) : null,
      [mx, imageMxc, useAuthentication]
    );

    // When the homeserver couldn't resolve a preview image, fall back to the
    // standard link-preview card so the link is not lost entirely.
    if (previewState.status === AsyncStatus.Success && (!fullUrl || !thumbUrl)) {
      return <UrlPreviewCard url={url} ts={ts} {...props} ref={ref} />;
    }
    if (previewState.status === AsyncStatus.Error) return null;

    const title = (typeof preview?.['og:title'] === 'string' && preview['og:title']) || 'GIF';
    const siteName =
      typeof preview?.['og:site_name'] === 'string' ? preview['og:site_name'] : undefined;
    const { width, aspectRatio } = getDisplaySize(
      Number(preview?.['og:image:width']) || undefined,
      Number(preview?.['og:image:height']) || undefined
    );

    const showImg = play ? fullUrl : thumbUrl;

    const startPlay = () => {
      setLoaded(false);
      setPlay(true);
    };
    const activate = () => (play ? setViewer(true) : startPlay());

    return (
      <Box direction="Column" gap="100" shrink="No">
        <div
          className={classNames(css.GifPreview, className)}
          style={{ width: toRem(width), aspectRatio: aspectRatio ?? '16 / 10' }}
          {...props}
          ref={ref}
        >
          {showImg && (
            <img
              className={css.GifPreviewImg}
              src={showImg}
              alt={title}
              title={title}
              tabIndex={0}
              onLoad={() => setLoaded(true)}
              onKeyDown={(evt) => onEnterOrSpace(activate)(evt)}
              onClick={activate}
            />
          )}
          {!loaded && (
            <span className={css.GifOverlay}>
              <Spinner variant="Secondary" size="400" />
            </span>
          )}
          {loaded && !play && (
            <button
              type="button"
              className={css.GifOverlay}
              aria-label={`Play ${title}`}
              onClick={startPlay}
            >
              <Icon src={Icons.Play} size="600" filled />
            </button>
          )}
          <span className={css.GifBadge}>
            <Text as="span" size="L400">
              GIF
            </Text>
          </span>
        </div>
        <Text size="T200" priority="300" truncate>
          <a href={url} target="_blank" rel="noreferrer">
            {siteName ? `${siteName} • ${title}` : title}
          </a>
        </Text>
        {fullUrl && (
          <ImageOverlay
            src={fullUrl}
            alt={title}
            viewer={viewer}
            requestClose={() => setViewer(false)}
            renderViewer={(p) => <ImageViewer {...p} />}
          />
        )}
      </Box>
    );
  }
);
