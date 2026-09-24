import {
  KkButton,
  KkEmptyState,
  KkErrorState,
  KkMeta,
  KkPanel,
  KkPanelSection,
  KkSkeletonRow,
} from '@furria/ui';
import type { FC } from 'react';
import type { GroupTone } from '@/features/groups';
import { GROUP_SECTION_TITLES } from '@/lib/group-sections';
import { toCalendarEntryMeta } from '../group-calendar-entries';
import {
  CALENDAR_ENTRY_EMPTY_LINE,
  CALENDAR_ENTRY_EMPTY_TITLE,
  CALENDAR_ENTRY_ERROR_TITLE,
  CALENDAR_ENTRY_RETRY_LABEL,
} from '../group-calendar-entry-labels';
import { useGroupCalendarEntries } from '../hooks/use-group-calendar-entries';
import { HubCalendarEntryRow } from './HubCalendarEntryRow';

const SKELETON_ROWS = 3;

interface HubCalendarEntriesPanelProps {
  groupId: number;
  tone: GroupTone;
}

export const HubCalendarEntriesPanel: FC<HubCalendarEntriesPanelProps> = ({ groupId, tone }) => {
  const calendarEntries = useGroupCalendarEntries(groupId);

  if (calendarEntries.errorMessage !== null) {
    const retry = (
      <KkButton size="small" variant="outlined" onClick={calendarEntries.retry}>
        {CALENDAR_ENTRY_RETRY_LABEL}
      </KkButton>
    );

    return (
      <KkPanelSection title={GROUP_SECTION_TITLES.events} groupTone={tone}>
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
      <KkPanelSection title={GROUP_SECTION_TITLES.events} groupTone={tone}>
        <KkPanel variant="block">
          <KkSkeletonRow count={SKELETON_ROWS} shape="select" />
        </KkPanel>
      </KkPanelSection>
    );
  }

  const rows = calendarEntries.entries.map((entry) => (
    <HubCalendarEntryRow
      key={entry.calendarEntryId}
      groupId={groupId}
      entry={entry}
      canAnswer={calendarEntries.canAnswer}
    />
  ));
  const isEmpty = rows.length === 0;
  const meta = <KkMeta>{toCalendarEntryMeta(rows.length)}</KkMeta>;
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
    <KkPanelSection title={GROUP_SECTION_TITLES.events} groupTone={tone} meta={meta}>
      <KkPanel variant={isEmpty ? 'block' : 'list'}>{body}</KkPanel>
    </KkPanelSection>
  );
};
