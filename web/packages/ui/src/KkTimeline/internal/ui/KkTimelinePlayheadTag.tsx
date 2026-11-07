import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { MotionValue } from 'motion/react';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { SCORE_FIGURES } from '../../../internal/score-paint';
import { kkTokens } from '../../../tokens';
import { LANE_VARS } from '../timeline-paint';

interface KkTimelinePlayheadTagProps {
  time: MotionValue<string>;
  name: string | null;
}

export const KkTimelinePlayheadTag: FC<KkTimelinePlayheadTagProps> = ({ time, name }) => {
  const nameText =
    name === null ? null : (
      <Box
        component="span"
        sx={{ minWidth: 0, overflow: 'clip', textOverflow: 'ellipsis', fontWeight: 700 }}
      >
        {name}
      </Box>
    );

  return (
    <Stack
      direction="row"
      aria-hidden
      data-kk-timeline-playhead-tag
      sx={(theme) => ({
        position: 'absolute',
        top: 0,
        left: '50%',
        zIndex: 4,
        alignItems: 'center',
        gap: 0.75,
        maxWidth: '72%',
        height: `var(${LANE_VARS.ruler})`,
        px: 0.75,
        translate: '-50% 0',
        borderRadius: `${kkTokens.radius.bar}px`,
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        typography: 'caption',
        lineHeight: 1,
        color: (theme.vars ?? theme).palette.background.paper,
        backgroundColor: (theme.vars ?? theme).palette.text.primary,
      })}
    >
      <Box component="span" sx={{ flexShrink: 0, fontWeight: 800, ...SCORE_FIGURES }}>
        <motion.span>{time}</motion.span>
      </Box>
      {nameText}
    </Stack>
  );
};
