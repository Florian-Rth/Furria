import { KkFrame } from '@furria/ui/KkFrame';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';

const keep = (): void => {};

const FRAME_SIZE = 3;

const SAMPLE_FRAMES = [
  { key: 'help-1', label: 'Auswahl 1', order: 1 },
  { key: 'help-2', label: 'Auswahl 2', order: 2 },
  { key: 'help-3', label: 'Auswahl 3', order: 3 },
  { key: 'help-4', label: 'Auswahl 4', order: 4 },
] as const;

export const SelectionHelpShowcasePreview: FC = () => {
  const frames = SAMPLE_FRAMES.map((frame) => {
    const mark = { kind: 'selection', order: frame.order } as const;
    return (
      <Grid key={frame.key} size={FRAME_SIZE}>
        <KkFrame label={frame.label} mark={mark} onSelect={keep} />
      </Grid>
    );
  });

  return (
    <Grid container spacing={0.25}>
      {frames}
    </Grid>
  );
};
