import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import { kkTokens } from '../../../tokens';
import { PERCENT, UNZOOMED_SCALE } from '../logic/way-zoom';

export type KkWayStageCueTone = 'soon' | 'now';

export type KkWayStageCueSide = 'above' | 'below';

const CLEARANCE = '1.875rem';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const cuePaints: Record<KkWayStageCueTone, (theme: Theme) => CSSObject> = {
  soon: (theme) => ({
    ...redInk(theme),
    backgroundColor: palette(theme).background.paper,
    boxShadow: `inset 0 0 0 ${kkTokens.line.section}px ${palette(theme).primary.main}, ${kkTokens.shadow.floating}`,
  }),
  now: (theme) => ({
    color: palette(theme).primary.contrastText,
    backgroundColor: palette(theme).primary.main,
    boxShadow: kkTokens.shadow.floating,
  }),
};

interface KkWayStageCueProps {
  x: number;
  y: number;
  text: string;
  tone: KkWayStageCueTone;
  side: KkWayStageCueSide;
}

export const KkWayStageCue: FC<KkWayStageCueProps> = ({ x, y, text, tone, side }) => {
  const offset = side === 'below' ? CLEARANCE : `calc(-100% - ${CLEARANCE})`;
  const origin = side === 'below' ? 'top center' : 'bottom center';
  const anchor = {
    transform: `translate3d(calc(${x * PERCENT}cqw - 50%), ${y * PERCENT}cqh, 0)`,
  };

  return (
    <Box
      data-kk-way-cue={tone}
      style={anchor}
      sx={{ position: 'absolute', left: 0, top: 0, zIndex: 3 }}
    >
      <Box sx={{ scale: UNZOOMED_SCALE, transformOrigin: 'top center' }}>
        <Box sx={{ transform: `translateY(${offset})`, transformOrigin: origin }}>
          <Typography
            key={tone}
            component="span"
            sx={(theme) => ({
              display: 'block',
              px: 1.25,
              py: 0.5,
              typography: 'subtitle2',
              fontWeight: 900,
              lineHeight: 1.1,
              whiteSpace: 'nowrap',
              fontVariantNumeric: 'tabular-nums',
              borderRadius: `${kkTokens.radius.pill}px`,
              animation: 'kk-way-cue-in 220ms cubic-bezier(.2,.7,.3,1)',
              '@keyframes kk-way-cue-in': {
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
    </Box>
  );
};
