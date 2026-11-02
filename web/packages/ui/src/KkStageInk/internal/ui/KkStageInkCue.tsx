import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import { kkTokens } from '../../../tokens';

export type KkStageInkCueTone = 'soon' | 'now';

export type KkStageInkCueSide = 'above' | 'below';

const CLEARANCE = '1.75rem';
const CLEARANCE_DESKTOP = '2.25rem';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const cuePaints: Record<KkStageInkCueTone, (theme: Theme) => CSSObject> = {
  soon: (theme) => ({
    ...redInk(theme),
    backgroundColor: palette(theme).background.paper,
    boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).primary.main}, ${kkTokens.shadow.floating}`,
  }),
  now: (theme) => ({
    color: palette(theme).primary.contrastText,
    backgroundColor: palette(theme).primary.main,
    boxShadow: kkTokens.shadow.floating,
  }),
};

interface KkStageInkCueProps {
  text: string;
  tone: KkStageInkCueTone;
  side: KkStageInkCueSide;
}

export const KkStageInkCue: FC<KkStageInkCueProps> = ({ text, tone, side }) => {
  const below = side === 'below';
  const offset = below ? CLEARANCE : `calc(-100% - ${CLEARANCE})`;
  const offsetDesktop = below ? CLEARANCE_DESKTOP : `calc(-100% - ${CLEARANCE_DESKTOP})`;

  return (
    <Box
      aria-hidden
      data-kk-stage-cue={tone}
      sx={(theme) => ({
        transform: `translateY(${offset})`,
        [theme.breakpoints.up('desktop')]: { transform: `translateY(${offsetDesktop})` },
      })}
    >
      <Typography
        key={tone}
        component="span"
        sx={(theme) => ({
          display: 'block',
          px: 1,
          py: 0.375,
          typography: 'caption',
          fontWeight: 900,
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
          fontVariantNumeric: 'tabular-nums',
          borderRadius: `${kkTokens.radius.pill}px`,
          animation: 'kk-stage-cue-in 220ms cubic-bezier(.2,.7,.3,1)',
          '@keyframes kk-stage-cue-in': {
            from: { transform: 'scale(0.82)', opacity: 0 },
            to: { transform: 'scale(1)', opacity: 1 },
          },
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          ...cuePaints[tone](theme),
        })}
      >
        {text}
      </Typography>
    </Box>
  );
};
