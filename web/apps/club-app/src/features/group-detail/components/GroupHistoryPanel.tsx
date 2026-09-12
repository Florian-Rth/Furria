import { KkChip, KkEmptyState, KkFactRow, KkPanel, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import { GROUP_SECTION_TITLES } from '@/lib/group-sections';
import {
  GROUP_HISTORY_KIND_LABELS,
  NO_HISTORY_LINE,
  NO_HISTORY_TITLE,
  toGroupHistoryEntries,
} from '../group-detail-labels';
import type { GroupDetailAdmin, GroupDetailMember } from '../schemas';

interface GroupHistoryPanelProps {
  pastMembers: readonly GroupDetailMember[];
  pastAdmins: readonly GroupDetailAdmin[];
  meta?: string;
}

export const GroupHistoryPanel: FC<GroupHistoryPanelProps> = ({
  pastMembers,
  pastAdmins,
  meta,
}) => {
  const entries = toGroupHistoryEntries(pastMembers, pastAdmins);

  const rows = entries.map((entry) => {
    const kindChip = (
      <KkChip tone="neutral" size="small">
        {GROUP_HISTORY_KIND_LABELS[entry.kind]}
      </KkChip>
    );

    return (
      <KkFactRow
        key={entry.key}
        title={entry.title}
        span={entry.span}
        meta={entry.meta}
        chip={kindChip}
      />
    );
  });

  const isEmpty = rows.length === 0;
  const variant = isEmpty ? 'block' : 'list';

  const body = isEmpty ? (
    <KkEmptyState size="panel" title={NO_HISTORY_TITLE} description={NO_HISTORY_LINE} />
  ) : (
    rows
  );

  return (
    <KkPanelSection title={GROUP_SECTION_TITLES.history} meta={meta}>
      <KkPanel variant={variant}>{body}</KkPanel>
    </KkPanelSection>
  );
};
