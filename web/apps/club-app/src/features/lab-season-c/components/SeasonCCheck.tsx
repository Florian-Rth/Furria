import { KkStateGlyph } from '@furria/ui/KkStateGlyph';
import { KkVisuallyHidden } from '@furria/ui/KkVisuallyHidden';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { SeasonCCheck as SeasonCCheckState } from '../hooks/use-season-c';
import { CHECK_WORDS } from '../season-c-copy';
import { CHECK_STATES, CHECK_WIDTH } from '../season-c-layout';

interface SeasonCCheckProps {
  check: SeasonCCheckState;
}

export const SeasonCCheck: FC<SeasonCCheckProps> = ({ check }) => (
  <Box sx={{ width: CHECK_WIDTH, display: 'grid', placeItems: 'center' }}>
    <KkStateGlyph state={CHECK_STATES[check.mark]} />
    <KkVisuallyHidden>
      {check.label} {CHECK_WORDS[check.mark]}
    </KkVisuallyHidden>
  </Box>
);
