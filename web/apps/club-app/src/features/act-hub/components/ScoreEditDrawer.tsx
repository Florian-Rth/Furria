import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkSelectRow } from '@furria/ui/KkSelectRow';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { ActHub } from '../hooks/use-act-hub';
import {
  CLOSE_LABEL,
  DOOR_COPY,
  EDIT_DOORS_TITLE,
  EDIT_DRAWER_LABEL,
  READINESS_TITLE,
} from '../score-copy';
import { ScoreReadinessStrip } from './ScoreReadinessStrip';

interface ScoreEditDrawerProps {
  score: ActHub;
}

export const ScoreEditDrawer: FC<ScoreEditDrawerProps> = ({ score }) => {
  const doors = score.doors.map((door) => (
    <KkSelectRow
      key={door.key}
      title={DOOR_COPY[door.key].label}
      meta={DOOR_COPY[door.key].meta}
      onClick={door.open}
    />
  ));
  const readiness =
    score.showReadiness && !score.wide ? (
      <KkPanelSection title={READINESS_TITLE}>
        <ScoreReadinessStrip items={score.readiness} />
      </KkPanelSection>
    ) : null;

  return (
    <KkBottomDrawer
      open={score.editOpen}
      label={EDIT_DRAWER_LABEL}
      closeLabel={CLOSE_LABEL}
      onClose={score.route.closeEdit}
    >
      <Stack sx={{ gap: 2, px: 2, pt: 1, pb: 3 }}>
        <KkPanelSection title={EDIT_DOORS_TITLE}>
          <KkPanel variant="list">{doors}</KkPanel>
        </KkPanelSection>
        {readiness}
      </Stack>
    </KkBottomDrawer>
  );
};
