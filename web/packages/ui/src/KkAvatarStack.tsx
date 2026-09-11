import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { buildAvatarStack } from './avatar-stack';
import { inkWash } from './internal/ink-wash';
import { KkAvatar } from './KkAvatar';
import type { KkSx } from './kk-sx';

const DEFAULT_MAX = 4;
const OVERLAP = '-10px';
const RING_WIDTH = '2.5px';
const BUBBLE_SIZE = 26;
const BUBBLE_WASH = '8%';
const BUBBLE_FONT = '0.6875rem';

interface KkAvatarStackProps {
  initials: readonly string[];
  max?: number;
  sx?: KkSx;
}

export const KkAvatarStack: FC<KkAvatarStackProps> = ({ initials, max = DEFAULT_MAX, sx }) => {
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
          backgroundColor: inkWash(theme, BUBBLE_WASH),
          boxShadow: `0 0 0 ${RING_WIDTH} ${(theme.vars ?? theme).palette.background.paper}`,
        })}
      >
        {plan.overflowLabel}
      </Box>
    );

  return (
    <Stack
      direction="row"
      aria-hidden
      data-kk-avatar-stack
      sx={[
        {
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
            boxShadow: `0 0 0 ${RING_WIDTH} ${(theme.vars ?? theme).palette.background.paper}`,
          })}
        >
          <KkAvatar initials={circle.initials} size="small" />
        </Box>
      ))}
      {overflowBubble}
    </Stack>
  );
};
