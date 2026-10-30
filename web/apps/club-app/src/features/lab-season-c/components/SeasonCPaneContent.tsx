import { KkCheckLine } from '@furria/ui/KkCheckLine';
import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import { KkMeta } from '@furria/ui/KkMeta';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { SeasonCSelection } from '../hooks/use-season-c';
import { useSeasonCPane } from '../hooks/use-season-c-pane';
import { EVENINGS_TITLE, MISSING_TITLE } from '../season-c-copy';
import { SeasonCPaneEvening } from './SeasonCPaneEvening';

interface SeasonCPaneContentProps {
  selection: SeasonCSelection;
}

export const SeasonCPaneContent: FC<SeasonCPaneContentProps> = ({ selection }) => {
  const pane = useSeasonCPane(selection);
  const checks = pane.checks.map((check) => (
    <KkCheckLine key={check.key} label={check.label} value={check.value} state={check.state} />
  ));
  const evenings = pane.evenings.map((evening) => (
    <SeasonCPaneEvening key={evening.eventId} evening={evening} />
  ));

  return (
    <Stack sx={{ gap: 1.5, minWidth: 0, py: 1 }}>
      <KkMeta>{pane.eyebrow}</KkMeta>
      <Stack component="section" sx={{ gap: 0.5, minWidth: 0 }}>
        <KkLaneInspector.Section text={MISSING_TITLE} />
        {checks}
      </Stack>
      <Stack component="section" sx={{ gap: 0.5, minWidth: 0 }}>
        <KkLaneInspector.Section text={EVENINGS_TITLE} />
        {evenings}
      </Stack>
    </Stack>
  );
};
