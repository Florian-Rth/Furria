import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import type { KkPracticeGlyph } from './kk-practice-glyphs';
import { KK_PRACTICE_GLYPHS } from './kk-practice-glyphs';

const HUD_MS = 1100;

export interface KkPracticeScreenHudSignal {
  stamp: number;
  glyph: KkPracticeGlyph;
  text: string;
  held: boolean;
}

interface KkPracticeScreenHudProps {
  signal: KkPracticeScreenHudSignal | null;
}

export const KkPracticeScreenHud: FC<KkPracticeScreenHudProps> = ({ signal }) =>
  signal === null ? null : (
    <Stack
      key={signal.stamp}
      aria-live="polite"
      data-kk-practice-hud
      data-held={signal.held}
      sx={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        zIndex: 3,
        alignItems: 'center',
        gap: 0.25,
        minWidth: '6.5rem',
        px: 2,
        py: 1.25,
        borderRadius: `${kkTokens.radius.base}px`,
        color: kkTokens.overlay.onPhotoText,
        backgroundColor: `color-mix(in srgb, ${kkTokens.overlay.scrimInk} 62%, transparent)`,
        backdropFilter: `blur(${kkTokens.glass.blur})`,
        pointerEvents: 'none',
        opacity: 0,
        transform: 'translate(-50%, -50%)',
        animation: `kk-practice-hud ${HUD_MS}ms cubic-bezier(.2,.7,.3,1) forwards`,
        '@keyframes kk-practice-hud': {
          '0%': { opacity: 0, transform: 'translate(-50%, -50%) scale(0.88)' },
          '14%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
          '72%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
          '100%': { opacity: 0, transform: 'translate(-50%, -50%) scale(1.04)' },
        },
        '&[data-held="true"]': { animation: 'none', opacity: 1 },
        '@media (prefers-reduced-motion: reduce)': {
          animation: `kk-practice-hud-fade ${HUD_MS}ms linear forwards`,
          '@keyframes kk-practice-hud-fade': {
            '0%': { opacity: 1 },
            '72%': { opacity: 1 },
            '100%': { opacity: 0 },
          },
        },
      }}
    >
      <Typography component="span" variant="h2" sx={{ lineHeight: 1, display: 'flex' }}>
        {KK_PRACTICE_GLYPHS[signal.glyph]}
      </Typography>
      <Typography
        component="span"
        variant="caption"
        sx={{ fontWeight: 800, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
      >
        {signal.text}
      </Typography>
    </Stack>
  );
