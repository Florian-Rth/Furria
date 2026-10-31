import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import { kkTokens } from '../../../tokens';

export type KkPracticeStageCueTone = 'soon' | 'now';

export type KkPracticeStageCueSide = 'above' | 'below';

const PERCENT = 100;
const CLEARANCE = '1.75rem';
const CLEARANCE_DESKTOP = '2.25rem';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const cuePaints: Record<KkPracticeStageCueTone, (theme: Theme) => CSSObject> = {
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

interface KkPracticeStageCueProps {
  x: number;
  y: number;
  text: string;
  tone: KkPracticeStageCueTone;
  side: KkPracticeStageCueSide;
}

export const KkPracticeStageCue: FC<KkPracticeStageCueProps> = ({ x, y, text, tone, side }) => {
  const below = side === 'below';
  const offset = below ? CLEARANCE : `calc(-100% - ${CLEARANCE})`;
  const offsetDesktop = below ? CLEARANCE_DESKTOP : `calc(-100% - ${CLEARANCE_DESKTOP})`;
  const anchor = {
    transform: `translate3d(calc(${x * PERCENT}cqw - 50%), ${y * PERCENT}cqh, 0)`,
  };

  return (
    <Box
      aria-hidden
      data-kk-practice-cue={tone}
      style={anchor}
      sx={{ position: 'absolute', left: 0, top: 0, zIndex: 3 }}
    >
      <Box
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
            animation: 'kk-practice-cue-in 220ms cubic-bezier(.2,.7,.3,1)',
            '@keyframes kk-practice-cue-in': {
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
    </Box>
  );
};
