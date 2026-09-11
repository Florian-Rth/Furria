import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { buildAvatarStack } from './avatar-stack';
import { inkWashScheme } from './internal/ink-wash';
import type { KkScheme } from './internal/scheme-paint';
import { applyScheme } from './internal/scheme-paint';
import { KkAvatar } from './KkAvatar';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

type KkAvatarStackRing = 'paper' | 'raised';

const DEFAULT_MAX = 4;
const OVERLAP = '-10px';
const RING_WIDTH = '2.5px';
const BUBBLE_SIZE = 26;
const BUBBLE_WASH_LIGHT = '10%';
const BUBBLE_WASH_DARK = '16%';
const BUBBLE_FONT = '0.6875rem';

const ring = (color: string): string => `0 0 0 ${RING_WIDTH} ${color}`;

const ringSchemes: Record<KkAvatarStackRing, (theme: Theme) => KkScheme> = {
  paper: (theme) => {
    const shadow = { boxShadow: ring((theme.vars ?? theme).palette.background.paper) };

    return { light: shadow, dark: shadow };
  },
  raised: () => ({
    light: { boxShadow: ring(kkTokens.color.light.panel2) },
    dark: { boxShadow: ring(kkTokens.color.dark.panel2) },
  }),
};

interface KkAvatarStackProps {
  initials: readonly string[];
  max?: number;
  ringOn?: KkAvatarStackRing;
  sx?: KkSx;
}

export const KkAvatarStack: FC<KkAvatarStackProps> = ({
  initials,
  max = DEFAULT_MAX,
  ringOn = 'paper',
  sx,
}) => {
  const plan = buildAvatarStack(initials, max);

  const overflowBubble =
    plan.overflowLabel === null ? null : (
      <Box
        component="span"
        sx={(theme) => ({
          display: 'inline-flex',
          width: BUBBLE_SIZE,
          height: BUBBLE_SIZE,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          flexShrink: 0,
          fontSize: BUBBLE_FONT,
          fontWeight: 800,
          color: 'text.secondary',
          ...applyScheme(
            theme,
            inkWashScheme(theme, BUBBLE_WASH_LIGHT, BUBBLE_WASH_DARK),
            ringSchemes[ringOn](theme),
          ),
        })}
      >
        {plan.overflowLabel}
      </Box>
    );

  return (
    <Stack
      component="span"
      direction="row"
      aria-hidden
      data-kk-avatar-stack
      sx={[
        {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0,
          minWidth: 0,
          '& > span + span': { ml: OVERLAP },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {plan.circles.map((circle) => (
        <Box
          key={circle.key}
          component="span"
          sx={(theme) => ({
            display: 'inline-flex',
            borderRadius: '50%',
            flexShrink: 0,
            ...applyScheme(theme, ringSchemes[ringOn](theme)),
          })}
        >
          <KkAvatar initials={circle.initials} size="small" component="span" />
        </Box>
      ))}
      {overflowBubble}
    </Stack>
  );
};
