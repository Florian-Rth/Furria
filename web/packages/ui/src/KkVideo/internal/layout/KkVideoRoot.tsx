import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';
import type { KkFullscreen } from '../../../use-kk-fullscreen';
import { FULLSCREEN_ACTIVE, fullscreenPaint } from '../fullscreen-paint';

export type KkVideoFit = 'fill' | 'band' | 'card';

const LANE_PHONE_WIDE =
  '@container kk-practice (min-aspect-ratio: 5/4) and (min-width: 48rem) and (min-height: 30rem)';

const RADIUS = `${kkTokens.radius.base}px`;

const FITS: Record<KkVideoFit, CSSObject> = {
  fill: { position: 'absolute', inset: 0, borderRadius: 'inherit' },
  band: {
    position: 'relative',
    width: '100%',
    aspectRatio: '16 / 9',
    maxHeight: '34cqh',
    minHeight: 0,
    [LANE_PHONE_WIDE]: { maxHeight: '100%' },
    borderRadius: RADIUS,
  },
  card: { position: 'relative', width: '100%', aspectRatio: '16 / 9', borderRadius: RADIUS },
};

const rootPaint =
  (fit: KkVideoFit) =>
  (theme: Theme): CSSObject => ({
    m: 0,
    minWidth: 0,
    overflow: 'clip',
    backgroundColor: kkTokens.overlay.scrimInk,
    color: kkTokens.overlay.onPhotoText,
    ...FITS[fit],
    ...fullscreenPaint(theme),
    [`${FULLSCREEN_ACTIVE} [data-kk-video-picture]`]: { objectPosition: 'center' },
  });

interface KkVideoRootProps extends PropsWithChildren {
  label: string;
  fit: KkVideoFit;
  fullscreen?: KkFullscreen;
}

export const KkVideoRoot: FC<KkVideoRootProps> = ({ label, fit, fullscreen, children }) => (
  <Box
    component="figure"
    ref={fullscreen?.target}
    aria-label={label}
    data-kk-video={fit}
    data-kk-fullscreen={fullscreen?.active}
    sx={rootPaint(fit)}
  >
    {children}
  </Box>
);
