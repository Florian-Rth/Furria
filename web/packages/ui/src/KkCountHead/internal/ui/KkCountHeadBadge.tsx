import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ElementType, FC } from 'react';
import { usePrintRun } from '../../../internal/print-in/print-run';
import { PRINT_EASE, PRINT_STILL, REDUCED_MOTION } from '../../../internal/print-in/print-stamp';
import { applyScheme, schemeEdge, schemeFill, schemeInk } from '../../../internal/scheme-paint';
import { controlFocus, TABULAR } from '../../../KkStartTile/internal/tile-paint';
import { KkVisuallyHidden } from '../../../KkVisuallyHidden';
import { kkTokens } from '../../../tokens';

const { light, dark } = kkTokens.color;

const FESTIVE_STAR = '"✶" / ""';
const GOLD_SHIFT = '2px';
const EMBOSS_DELAY_MS = 980;
const EMBOSS_MS = 560;
const PLATE_SHARE = { light: '100%', dark: '28%' } as const;

const emboss = keyframes`
  0% {
    opacity: 0;
    transform: scale(1.3);
  }
  48% {
    opacity: 1;
    transform: scale(0.93);
  }
  74% {
    transform: scale(1.025);
  }
  100% {
    opacity: 1;
    transform: none;
  }
`;

const goldPlate = keyframes`
  0% {
    opacity: 0;
    transform: translate(7px, 6px);
  }
  50% {
    opacity: 1;
    transform: translate(7px, 6px);
  }
  100% {
    opacity: 1;
    transform: translate(${GOLD_SHIFT}, ${GOLD_SHIFT});
  }
`;

const mix = (color: string, amount: string): string =>
  `color-mix(in srgb, ${color} ${amount}, transparent)`;

const landingOf = (motion: string, settled: boolean): CSSObject =>
  settled
    ? PRINT_STILL
    : {
        animation: `${motion} ${EMBOSS_MS}ms ${PRINT_EASE} ${EMBOSS_DELAY_MS}ms both`,
        [REDUCED_MOTION]: PRINT_STILL,
      };

const badgePaintOf =
  (festive: boolean, settled: boolean) =>
  (theme: Theme): CSSObject => ({
    position: 'relative',
    isolation: 'isolate',
    pointerEvents: 'auto',
    alignItems: 'baseline',
    gap: 0.4,
    px: 1,
    py: 0.375,
    borderWidth: kkTokens.line.hair,
    borderStyle: 'solid',
    borderRadius: `${kkTokens.radius.pill}px`,
    textDecoration: 'none',
    ...landingOf(`${emboss}`, settled),
    ...applyScheme(
      theme,
      schemeFill(mix(light.gold, '20%'), mix(dark.gold, '18%')),
      schemeEdge(light.goldInk, dark.goldInk),
      schemeInk(light.goldInk, dark.goldInk),
      {
        light: { '--kk-badge-plate': mix(light.gold, PLATE_SHARE.light) },
        dark: {
          '--kk-badge-plate': `color-mix(in srgb, ${dark.gold} ${PLATE_SHARE.dark}, ${dark.panel2})`,
        },
      },
    ),
    ...controlFocus(theme),
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: -kkTokens.line.hair,
      zIndex: -1,
      borderRadius: 'inherit',
      pointerEvents: 'none',
      backgroundColor: 'var(--kk-badge-plate)',
      transform: `translate(${GOLD_SHIFT}, ${GOLD_SHIFT})`,
      ...landingOf(`${goldPlate}`, settled),
    },
    '&::after': festive ? { content: FESTIVE_STAR, alignSelf: 'center' } : undefined,
  });

const VALUE_PAINT: CSSObject = {
  ...TABULAR,
  lineHeight: 1,
  letterSpacing: kkTokens.type.tracking.display,
  color: 'inherit',
};

interface KkCountHeadBadgeProps {
  value: number;
  word: string;
  label: string;
  festive: boolean;
  component?: ElementType;
  to?: string;
}

export const KkCountHeadBadge: FC<KkCountHeadBadgeProps> = ({
  value,
  word,
  label,
  festive,
  component,
  to,
}) => {
  const { settled } = usePrintRun();

  return (
    <Box component="li" sx={{ display: 'inline-flex', verticalAlign: 'middle' }}>
      <Stack
        component={component ?? 'span'}
        to={to}
        direction="row"
        sx={badgePaintOf(festive, settled)}
      >
        <Typography component="span" variant="h4" aria-hidden sx={VALUE_PAINT}>
          {value}
        </Typography>
        <Typography component="span" variant="h4" aria-hidden sx={VALUE_PAINT}>
          {word}
        </Typography>
        <KkVisuallyHidden>{label}</KkVisuallyHidden>
      </Stack>
    </Box>
  );
};
