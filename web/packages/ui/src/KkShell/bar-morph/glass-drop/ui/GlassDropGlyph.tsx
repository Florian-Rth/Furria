import Box from '@mui/material/Box';
import type { FC } from 'react';
import { KkBroomMark } from '../../../../KkBroomMark';
import { KkIcon } from '../../../../KkIcon';
import { KkShellBarMark } from '../../../internal/layout/KkShellBarMark';
import type { GlassDropGlyph as GlassDropGlyphName } from '../logic/glass-drop-plan';

const BROOM_SIZE = 30;

interface GlassDropGlyphProps {
  glyph: GlassDropGlyphName;
}

export const GlassDropGlyph: FC<GlassDropGlyphProps> = ({ glyph }) => {
  const mark =
    glyph === 'broom' ? (
      <KkBroomMark size={BROOM_SIZE} sx={{ color: 'primary.main' }} />
    ) : (
      <KkIcon name={glyph} size="medium" sx={{ color: 'text.primary' }} />
    );

  return (
    <Box sx={{ position: 'relative' }}>
      <KkShellBarMark>{mark}</KkShellBarMark>
    </Box>
  );
};
