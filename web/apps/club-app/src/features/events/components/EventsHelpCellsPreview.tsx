import { KkStateCard } from '@furria/ui/KkStateCard';
import type { KkStepState } from '@furria/ui/step-state';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { PANE_ICONS, PANE_TITLES } from '../event-board-copy';
import type { EventPaneKey } from '../schemas';

interface SampleCell {
  pane: EventPaneKey;
  state: KkStepState;
  fact: string;
}

const SAMPLE_CELLS: readonly SampleCell[] = [
  { pane: 'website', state: 'done', fact: 'online' },
  { pane: 'details', state: 'done', fact: 'komplett' },
  { pane: 'tickets', state: 'overdue', fact: 'VVK fehlt' },
  { pane: 'runningOrder', state: 'waiting', fact: 'ab 03.01.' },
  { pane: 'hall', state: 'current', fact: 'kein Tischplan' },
];

const keep = (): void => {};

export const EventsHelpCellsPreview: FC = () => {
  const cells = SAMPLE_CELLS.map((cell) => (
    <KkStateCard.Cell
      key={cell.pane}
      icon={PANE_ICONS[cell.pane]}
      state={cell.state}
      fact={cell.fact}
      ariaLabel={PANE_TITLES[cell.pane]}
      onSelect={keep}
    />
  ));

  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 0.5, minWidth: 0 }}>
      {cells}
    </Stack>
  );
};
