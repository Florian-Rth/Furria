import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import type { FC } from 'react';
import { goldInkOf } from '../../../internal/gold-ink';
import { typePixelsOf } from '../../../internal/type-pixels';

export type KkHallNumeralTone = 'music' | 'lead' | 'rest' | 'onAccent';

const CENTRE = 50;
const EM_UNITS = 128;
const POP = 'kk-hall-numeral-pop 180ms cubic-bezier(.2,.7,.3,1)';

const tonePaints: Record<KkHallNumeralTone, (theme: Theme) => CSSObject> = {
  music: (theme) => ({ color: (theme.vars ?? theme).palette.primary.main }),
  lead: (theme) => goldInkOf(theme),
  rest: (theme) => ({ color: (theme.vars ?? theme).palette.text.disabled }),
  onAccent: (theme) => ({ color: (theme.vars ?? theme).palette.primary.contrastText }),
};

interface KkHallNumeralProps {
  text: string;
  tone: KkHallNumeralTone;
}

export const KkHallNumeral: FC<KkHallNumeralProps> = ({ text, tone }) => {
  const theme = useTheme();
  const scale = EM_UNITS / typePixelsOf(theme.typography.h1.fontSize);
  const placement = `translate(${CENTRE} ${CENTRE}) scale(${scale})`;

  return (
    <Box
      component="svg"
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      sx={{ width: '100%', height: '100%', overflow: 'visible' }}
    >
      <g transform={placement}>
        <Box
          key={text}
          component="text"
          x={0}
          y={0}
          textAnchor="middle"
          dominantBaseline="central"
          sx={[
            (paint) => ({
              typography: 'h1',
              fontVariantNumeric: 'tabular-nums',
              fill: 'currentColor',
              transformBox: 'fill-box',
              transformOrigin: 'center',
              animation: POP,
              '@keyframes kk-hall-numeral-pop': {
                from: { transform: 'scale(1.12)', opacity: 0.55 },
                to: { transform: 'scale(1)', opacity: 1 },
              },
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
              ...tonePaints[tone](paint),
            }),
          ]}
        >
          {text}
        </Box>
      </g>
    </Box>
  );
};
