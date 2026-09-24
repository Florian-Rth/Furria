import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KkBroomMark } from '../../../../KkBroomMark';
import { KkIcon } from '../../../../KkIcon';
import type { BroomSweepGlyph } from '../logic/broom-sweep-plan';
import { SWEEP_VAR, varOf } from '../logic/broom-sweep-vars';

const BROOM_SIZE = 30;

interface BroomSweepGhostGlyphProps {
  glyph: BroomSweepGlyph;
}

export const BroomSweepGhostGlyph: FC<BroomSweepGhostGlyphProps> = ({ glyph }) => {
  const mark =
    glyph === 'broom' ? (
      <KkBroomMark size={BROOM_SIZE} sx={{ color: 'primary.main' }} />
    ) : (
      <KkIcon name={glyph} size="medium" />
    );

  return (
    <Stack
      sx={{
        gridArea: '1 / 1',
        color: 'text.primary',
        transform: varOf(SWEEP_VAR.ghostGlyph, 'none'),
        opacity: varOf(SWEEP_VAR.ghostGlyphOpacity, '0'),
      }}
    >
      {mark}
    </Stack>
  );
};
