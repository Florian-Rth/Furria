import Box from '@mui/material/Box';
import type { FC } from 'react';
import { percentOf } from '../../../internal/score-paint';
import { kkTokens } from '../../../tokens';
import { stepsTop } from '../timeline-paint';

const MARK = '0.5rem';

export interface KkTimelineKeyframeMark {
  key: string;
  share: number;
  selected: boolean;
}

interface KkTimelineKeyframesProps {
  marks: readonly KkTimelineKeyframeMark[];
}

export const KkTimelineKeyframes: FC<KkTimelineKeyframesProps> = ({ marks }) => {
  const diamonds = marks.map((mark) => (
    <Box
      key={mark.key}
      component="span"
      data-selected={mark.selected}
      style={{ left: percentOf(mark.share) }}
      sx={{
        position: 'absolute',
        top: `calc(${stepsTop} - ${MARK})`,
        width: MARK,
        height: MARK,
        translate: '-50% 0',
        rotate: '45deg',
        borderWidth: kkTokens.line.hair,
        borderStyle: 'solid',
        borderColor: 'text.secondary',
        bgcolor: 'background.paper',
        '&[data-selected="true"]': { bgcolor: 'text.primary', borderColor: 'text.primary' },
      }}
    />
  ));

  return (
    <Box
      aria-hidden
      data-kk-timeline-keyframes
      sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}
    >
      {diamonds}
    </Box>
  );
};
