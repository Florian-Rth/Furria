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
const OVERFLOW_GAP = 0.75;
const CIRCLE = '[data-kk-avatar-stack-circle]';
const OVERFLOW = '[data-kk-avatar-stack-overflow]';
const RING_WIDTH = '2.5px';
const BUBBLE_SIZE = 26;
const BUBBLE_WASH_LIGHT = '10%';
const BUBBLE_WASH_DARK = '16%';

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
  total?: number;
  ringOn?: KkAvatarStackRing;
  sx?: KkSx;
}

export const KkAvatarStack: FC<KkAvatarStackProps> = ({
  initials,
  max = DEFAULT_MAX,
  total,
  ringOn = 'paper',
  sx,
}) => {
  const plan = buildAvatarStack(initials, max, total);

  const overflowBubble =
    plan.overflowLabel === null ? null : (
      <Box
        component="span"
        data-kk-avatar-stack-overflow
        sx={(theme) => ({
          display: 'inline-flex',
          width: BUBBLE_SIZE,
          height: BUBBLE_SIZE,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          flexShrink: 0,
          ...theme.typography.caption,
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
          [`& > ${CIRCLE} + ${CIRCLE}`]: { ml: OVERLAP },
          [`& > ${OVERFLOW}`]: { ml: OVERFLOW_GAP },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {plan.circles.map((circle) => (
        <Box
          key={circle.key}
          component="span"
          data-kk-avatar-stack-circle
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
