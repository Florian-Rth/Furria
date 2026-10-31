import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkLead } from '@furria/ui/KkLead';
import { KkNote } from '@furria/ui/KkNote';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { KkPanelAction } from '@furria/ui/panel-action';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { GroupTone } from '@/features/groups/group-identity';
import { toUsualTrainingTimesSentence } from '@/features/groups/group-identity';
import { GROUP_SECTION_TITLES } from '@/lib/group-sections';
import { useUsualTrainingTimesInfo } from '../hooks/use-usual-training-times-info';
import type { UsualTrainingTime } from '../schemas';
import {
  USUAL_TIMES_ADD_ACTION_LABEL,
  USUAL_TIMES_ADD_LABEL,
  USUAL_TIMES_ADMIN_NOTE,
  USUAL_TIMES_ARCHIVED_VENUE_NOTE,
  USUAL_TIMES_EMPTY_LINE,
  USUAL_TIMES_EMPTY_TITLE,
  USUAL_TIMES_FULL_NOTE,
} from '../usual-training-time-labels';
import { HubUsualTrainingTimeRow } from './HubUsualTrainingTimeRow';

const NEW_USUAL_TIME_ROUTE = '/groups/$groupId/usual-training-times/new';

interface HubUsualTrainingTimesPanelProps {
  groupId: number;
  tone: GroupTone;
  usualTimes: readonly UsualTrainingTime[];
  canManage: boolean;
}

export const HubUsualTrainingTimesPanel: FC<HubUsualTrainingTimesPanelProps> = ({
  groupId,
  tone,
  usualTimes,
  canManage,
}) => {
  const info = useUsualTrainingTimesInfo({ usualTimes });
  const sentence = toUsualTrainingTimesSentence(usualTimes);
  const isEmpty = usualTimes.length === 0;

  const action: KkPanelAction | undefined = canManage
    ? {
        label: USUAL_TIMES_ADD_LABEL,
        icon: 'add',
        ariaLabel: USUAL_TIMES_ADD_ACTION_LABEL,
        component: Link,
        to: NEW_USUAL_TIME_ROUTE,
        params: { groupId: String(groupId) },
      }
    : undefined;

  const rows = usualTimes.map((usualTime) => (
    <HubUsualTrainingTimeRow
      key={usualTime.usualTrainingTimeId}
      groupId={groupId}
      usualTime={usualTime}
      venueIsArchived={
        usualTime.venueId !== null && info.unavailableVenueIds.has(usualTime.venueId)
      }
    />
  ));

  const sentenceBlock =
    sentence === null ? null : (
      <KkPanel variant="block">
        <KkLead>{sentence}</KkLead>
      </KkPanel>
    );

  const list = isEmpty ? (
    <KkPanel variant="block">
      <KkEmptyState
        size="panel"
        title={USUAL_TIMES_EMPTY_TITLE}
        description={USUAL_TIMES_EMPTY_LINE}
      />
    </KkPanel>
  ) : (
    <KkPanel variant="list">{rows}</KkPanel>
  );

  const fullNote = canManage && info.isFull ? <KkNote>{USUAL_TIMES_FULL_NOTE}</KkNote> : null;
  const archivedVenueNote =
    canManage && info.unavailableVenueIds.size > 0 ? (
      <KkNote tone="warning">{USUAL_TIMES_ARCHIVED_VENUE_NOTE}</KkNote>
    ) : null;

  const tools = canManage ? (
    <Stack sx={{ gap: 1, minWidth: 0 }}>
      <KkNote>{USUAL_TIMES_ADMIN_NOTE}</KkNote>
      {fullNote}
      {archivedVenueNote}
    </Stack>
  ) : null;

  return (
    <KkPanelSection
      title={GROUP_SECTION_TITLES.usualTrainingTimes}
      groupTone={tone}
      action={action}
    >
      <Stack sx={{ gap: 1.5, minWidth: 0 }}>
        {sentenceBlock}
        {list}
        {tools}
      </Stack>
    </KkPanelSection>
  );
};
