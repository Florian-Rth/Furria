import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../tokens';
import { redInk } from './red-ink';

export type KkPhotoStampScale = 'card' | 'band';

const STAMP_TILT = 'rotate(-8deg)';
const STAMP_PAPER = '92%';
const SCRIM = '38%';

const VARIANT_BY_SCALE = { card: 'h4', band: 'h2' } as const;

const scrimPaint = (theme: Theme) => {
  const palette = (theme.vars ?? theme).palette;
  return {
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    alignItems: 'center',
    justifyContent: 'center',
    px: 2,
    backgroundColor: `color-mix(in srgb, ${palette.background.default} ${SCRIM}, transparent)`,
  } as const;
};

const stampPaint = (theme: Theme) => {
  const palette = (theme.vars ?? theme).palette;
  return {
    ...redInk(theme),
    maxWidth: '100%',
    transform: STAMP_TILT,
    border: `${kkTokens.line.page}px solid currentColor`,
    outline: `${kkTokens.line.hair}px solid currentColor`,
    outlineOffset: theme.spacing(-0.75),
    borderRadius: `${kkTokens.radius.bar * 2}px`,
    backgroundColor: `color-mix(in srgb, ${palette.background.paper} ${STAMP_PAPER}, transparent)`,
    boxShadow: kkTokens.shadow.floating,
    px: 2,
    py: 0.75,
    textTransform: 'uppercase',
    lineHeight: 1,
  } as const;
};

interface KkPhotoStampProps {
  label: string;
  scale: KkPhotoStampScale;
}

export const KkPhotoStamp: FC<KkPhotoStampProps> = ({ label, scale }) => (
  <Stack data-kk-event-picture-stamp sx={scrimPaint}>
    <Typography variant={VARIANT_BY_SCALE[scale]} component="span" sx={stampPaint}>
      {label}
    </Typography>
  </Stack>
);
