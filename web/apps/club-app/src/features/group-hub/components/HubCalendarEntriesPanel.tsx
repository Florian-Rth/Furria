import { KkButton } from '@furria/ui/KkButton';
import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkErrorState } from '@furria/ui/KkErrorState';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkSkeletonRow } from '@furria/ui/KkSkeletonRow';
import type { KkPanelAction } from '@furria/ui/panel-action';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { GroupTone } from '@/features/groups/group-identity';
import { GROUP_SECTION_TITLES } from '@/lib/group-sections';
import {
  CALENDAR_ENTRY_EMPTY_LINE,
  CALENDAR_ENTRY_EMPTY_TITLE,
  CALENDAR_ENTRY_ERROR_TITLE,
  CALENDAR_ENTRY_RETRY_LABEL,
  PLAN_TRAINING_ACTION_LABEL,
  PLAN_TRAINING_LABEL,
} from '../group-calendar-entry-labels';
import { useGroupCalendarEntries } from '../hooks/use-group-calendar-entries';
import { useTrainingPlanSearch } from '../hooks/use-training-plan-search';
import type { UsualTrainingTime } from '../schemas';
import { HubCalendarEntryRow } from './HubCalendarEntryRow';

const SKELETON_ROWS = 3;
const NEW_ENTRY_ROUTE = '/calendar/new';

interface HubCalendarEntriesPanelProps {
  groupId: number;
  tone: GroupTone;
  usualTimes: readonly UsualTrainingTime[];
  canPlan: boolean;
}

export const HubCalendarEntriesPanel: FC<HubCalendarEntriesPanelProps> = ({
  groupId,
  tone,
  usualTimes,
  canPlan,
}) => {
  const calendarEntries = useGroupCalendarEntries(groupId);
  const planSearch = useTrainingPlanSearch(groupId, usualTimes);
  const action: KkPanelAction | undefined = canPlan
    ? {
        label: PLAN_TRAINING_LABEL,
        icon: 'add',
        ariaLabel: PLAN_TRAINING_ACTION_LABEL,
        component: Link,
        to: NEW_ENTRY_ROUTE,
        search: planSearch,
      }
    : undefined;

  if (calendarEntries.errorMessage !== null) {
    const retry = (
      <KkButton size="small" variant="outlined" onClick={calendarEntries.retry}>
        {CALENDAR_ENTRY_RETRY_LABEL}
      </KkButton>
    );

    return (
      <KkPanelSection title={GROUP_SECTION_TITLES.events} groupTone={tone} action={action}>
        <KkPanel variant="block">
          <KkErrorState
            title={CALENDAR_ENTRY_ERROR_TITLE}
            description={calendarEntries.errorMessage}
            action={retry}
          />
        </KkPanel>
      </KkPanelSection>
    );
  }

  if (calendarEntries.isLoading) {
    return (
      <KkPanelSection title={GROUP_SECTION_TITLES.events} groupTone={tone} action={action}>
        <KkPanel variant="block">
          <KkSkeletonRow count={SKELETON_ROWS} shape="select" />
        </KkPanel>
      </KkPanelSection>
    );
  }

  const rows = calendarEntries.entries.map((entry) => (
    <HubCalendarEntryRow key={entry.calendarEntryId} groupId={groupId} entry={entry} />
  ));
  const isEmpty = rows.length === 0;
  const body = isEmpty ? (
    <KkEmptyState
      size="panel"
      title={CALENDAR_ENTRY_EMPTY_TITLE}
      description={CALENDAR_ENTRY_EMPTY_LINE}
    />
  ) : (
    rows
  );

  return (
    <KkPanelSection title={GROUP_SECTION_TITLES.events} groupTone={tone} action={action}>
      <KkPanel variant={isEmpty ? 'block' : 'list'}>{body}</KkPanel>
    </KkPanelSection>
  );
};
