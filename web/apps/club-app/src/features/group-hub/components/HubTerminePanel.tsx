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
import { toTermineMeta } from '../group-termine';
import {
  TERMINE_EMPTY_LINE,
  TERMINE_EMPTY_TITLE,
  TERMINE_ERROR_TITLE,
  TERMINE_RETRY_LABEL,
} from '../group-termine-labels';
import { useGroupTermine } from '../hooks/use-group-termine';
import { HubTermineRow } from './HubTermineRow';

const SKELETON_ROWS = 3;

interface HubTerminePanelProps {
  groupId: number;
  tone: GroupTone;
}

export const HubTerminePanel: FC<HubTerminePanelProps> = ({ groupId, tone }) => {
  const termine = useGroupTermine(groupId);

  if (termine.errorMessage !== null) {
    const retry = (
      <KkButton size="small" variant="outlined" onClick={termine.retry}>
        {TERMINE_RETRY_LABEL}
      </KkButton>
    );

    return (
      <KkPanelSection title={GROUP_SECTION_TITLES.events} groupTone={tone}>
        <KkPanel variant="block">
          <KkErrorState
            title={TERMINE_ERROR_TITLE}
            description={termine.errorMessage}
            action={retry}
          />
        </KkPanel>
      </KkPanelSection>
    );
  }

  if (termine.isLoading) {
    return (
      <KkPanelSection title={GROUP_SECTION_TITLES.events} groupTone={tone}>
        <KkPanel variant="block">
          <KkSkeletonRow count={SKELETON_ROWS} shape="select" />
        </KkPanel>
      </KkPanelSection>
    );
  }

  const rows = termine.entries.map((entry) => (
    <HubTermineRow key={entry.calendarEntryId} groupId={groupId} entry={entry} />
  ));
  const isEmpty = rows.length === 0;
  const meta = <KkMeta>{toTermineMeta(rows.length)}</KkMeta>;
  const body = isEmpty ? (
    <KkEmptyState size="panel" title={TERMINE_EMPTY_TITLE} description={TERMINE_EMPTY_LINE} />
  ) : (
    rows
  );

  return (
    <KkPanelSection title={GROUP_SECTION_TITLES.events} groupTone={tone} meta={meta}>
      <KkPanel variant={isEmpty ? 'block' : 'list'}>{body}</KkPanel>
    </KkPanelSection>
  );
};
