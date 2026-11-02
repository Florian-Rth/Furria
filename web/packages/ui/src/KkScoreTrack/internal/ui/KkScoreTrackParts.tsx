import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkGroupTone } from '../../../internal/group-tone';
import { percentOf } from '../score-paint';
import type { KkScoreTrackPart } from './KkScoreTrackPartBand';
import { KkScoreTrackPartBand } from './KkScoreTrackPartBand';

interface KkScoreTrackPartsProps {
  tone: KkGroupTone | null;
  parts: readonly KkScoreTrackPart[];
  onSelect?: (key: number) => void;
}

export const KkScoreTrackParts: FC<KkScoreTrackPartsProps> = ({ tone, parts, onSelect }) => {
  const bands = parts.map((part) => (
    <KkScoreTrackPartBand
      key={part.key}
      part={part}
      tone={tone}
      place={{ left: percentOf(part.from), width: percentOf(part.to - part.from) }}
      onSelect={onSelect}
    />
  ));

  return (
    <Box
      aria-hidden={onSelect === undefined ? true : undefined}
      data-kk-score-parts
      sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      {bands}
    </Box>
  );
};
