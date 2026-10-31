import { KkButton } from '@furria/ui/KkButton';
import { KkHubRow } from '@furria/ui/KkHubRow';
import { KkNote } from '@furria/ui/KkNote';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { Studio } from '@/features/acts/schemas';
import { useVisitHistory } from '../hooks/use-visit-history';
import {
  HISTORY_EMPTY,
  HISTORY_TITLE,
  REDO_ARIA,
  REDO_LABEL,
  UNDO_ARIA,
  UNDO_LABEL,
} from '../undo-copy';

interface StudioHistorySectionProps {
  actId: number;
  studio: Studio;
}

export const StudioHistorySection: FC<StudioHistorySectionProps> = ({ actId, studio }) => {
  const visit = useVisitHistory(actId, studio);
  const rows = visit.rows.map((row) => (
    <KkHubRow
      key={row.key}
      label={row.label}
      icon="undo"
      meta={row.meta}
      hint={row.hint}
      hintTone="neutral"
      dimWhenInert={false}
    />
  ));
  const list = rows.length === 0 ? <KkNote>{HISTORY_EMPTY}</KkNote> : <KkPanel>{rows}</KkPanel>;

  return (
    <KkPanelSection title={HISTORY_TITLE}>
      <Stack sx={{ gap: 1, minWidth: 0 }}>
        <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
          <KkButton
            size="small"
            variant="outlined"
            disabled={!visit.canUndo}
            ariaLabel={UNDO_ARIA}
            onClick={visit.undo}
          >
            {UNDO_LABEL}
          </KkButton>
          <KkButton
            size="small"
            variant="outlined"
            disabled={!visit.canRedo}
            ariaLabel={REDO_ARIA}
            onClick={visit.redo}
          >
            {REDO_LABEL}
          </KkButton>
        </Stack>
        {list}
      </Stack>
    </KkPanelSection>
  );
};
