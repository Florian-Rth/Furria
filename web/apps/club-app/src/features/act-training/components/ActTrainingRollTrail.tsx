import { KkMeta } from '@furria/ui/KkMeta';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { TrainingRollTrailLine } from '../hooks/use-training-roll-pane';
import { ROLL_TRAIL_TITLE } from '../training-copy';

interface ActTrainingRollTrailProps {
  lines: readonly TrainingRollTrailLine[];
}

export const ActTrainingRollTrail: FC<ActTrainingRollTrailProps> = ({ lines }) => {
  if (lines.length === 0) {
    return null;
  }

  const items = lines.map((line) => (
    <KkMeta key={line.personId} component="li">
      {line.text}
    </KkMeta>
  ));

  return (
    <KkPanelSection title={ROLL_TRAIL_TITLE}>
      <Stack component="ul" sx={{ gap: 0.5, m: 0, p: 0, listStyle: 'none', minWidth: 0 }}>
        {items}
      </Stack>
    </KkPanelSection>
  );
};
