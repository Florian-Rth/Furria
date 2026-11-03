import { CLOSE_LABEL } from '@furria/studio/score-copy';
import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkSelectRow } from '@furria/ui/KkSelectRow';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { DOOR_COPY, EDIT_DOORS_TITLE, EDIT_DRAWER_LABEL, READINESS_TITLE } from '../score-copy';
import type { ScoreDoorView, ScoreReadinessView } from '../score-hub-views';
import { ScoreReadinessStrip } from './ScoreReadinessStrip';

interface ScoreEditDrawerProps {
  open: boolean;
  doors: readonly ScoreDoorView[];
  readiness: readonly ScoreReadinessView[] | null;
  onClose: () => void;
}

export const ScoreEditDrawer: FC<ScoreEditDrawerProps> = ({ open, doors, readiness, onClose }) => {
  const rows = doors.map((door) => (
    <KkSelectRow
      key={door.key}
      title={DOOR_COPY[door.key].label}
      meta={DOOR_COPY[door.key].meta}
      onClick={door.open}
    />
  ));
  const readinessSection =
    readiness === null ? null : (
      <KkPanelSection title={READINESS_TITLE}>
        <ScoreReadinessStrip items={readiness} />
      </KkPanelSection>
    );

  return (
    <KkBottomDrawer
      open={open}
      label={EDIT_DRAWER_LABEL}
      closeLabel={CLOSE_LABEL}
      onClose={onClose}
    >
      <Stack sx={{ gap: 2, px: 2, pt: 1, pb: 3 }}>
        <KkPanelSection title={EDIT_DOORS_TITLE}>
          <KkPanel variant="list">{rows}</KkPanel>
        </KkPanelSection>
        {readinessSection}
      </Stack>
    </KkBottomDrawer>
  );
};
