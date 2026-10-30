import { KkButton } from '@furria/ui/KkButton';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkTickRow } from '@furria/ui/KkTickRow';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { SeasonCPaneEvening as SeasonCPaneEveningState } from '../hooks/use-season-c-pane';
import { CAST_CHANGE, CAST_CLOSE } from '../season-c-copy';
import { SeasonCPaneCast } from './SeasonCPaneCast';

interface SeasonCPaneEveningProps {
  evening: SeasonCPaneEveningState;
}

export const SeasonCPaneEvening: FC<SeasonCPaneEveningProps> = ({ evening }) => {
  const castText = evening.castOpen ? CAST_CLOSE : CAST_CHANGE;
  const changes = evening.on ? (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0, pl: 1 }}>
      <KkMeta sx={{ flex: 1, minWidth: 0 }}>{evening.changeLine}</KkMeta>
      <KkButton variant="text" size="small" onClick={evening.toggleCast}>
        {castText}
      </KkButton>
    </Stack>
  ) : null;
  const cast = evening.castOpen ? <SeasonCPaneCast evening={evening} /> : null;

  return (
    <Stack sx={{ gap: 0.5, minWidth: 0 }}>
      <KkTickRow
        title={evening.title}
        span={evening.day}
        meta={evening.meta}
        checked={evening.on}
        disabled={evening.pending}
        onToggle={evening.toggle}
      />
      {changes}
      {cast}
    </Stack>
  );
};
