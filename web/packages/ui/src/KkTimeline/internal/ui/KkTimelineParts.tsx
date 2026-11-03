import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkGroupTone } from '../../../internal/group-tone';
import { percentOf } from '../../../internal/score-paint';
import type { KkTimelinePart } from './KkTimelinePartBand';
import { KkTimelinePartBand } from './KkTimelinePartBand';

interface KkTimelinePartsProps {
  tone: KkGroupTone | null;
  parts: readonly KkTimelinePart[];
  lane?: string;
  onSelect?: (key: number) => void;
}

export const KkTimelineParts: FC<KkTimelinePartsProps> = ({ tone, parts, lane, onSelect }) => {
  const bands = parts.map((part) => (
    <KkTimelinePartBand
      key={part.key}
      part={part}
      tone={tone}
      place={{ left: percentOf(part.from), width: percentOf(part.to - part.from) }}
      lane={lane}
      onSelect={onSelect}
    />
  ));

  return (
    <Box
      aria-hidden={onSelect === undefined ? true : undefined}
      data-kk-timeline-parts
      sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      {bands}
    </Box>
  );
};
