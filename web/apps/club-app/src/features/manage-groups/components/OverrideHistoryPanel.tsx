import { KkChip, KkEmptyState, KkFactRow, KkPanel } from '@furria/ui';
import type { FC } from 'react';
import type { GroupHistoryKind } from '../manage-groups-labels';
import { MANAGE_GROUPS_SECTION_TITLES, toGroupHistoryEntries } from '../manage-groups-labels';
import type { ManagedAdmin, ManagedMember } from '../schemas';
import { ManagedGroupsSection } from './ManagedGroupsSection';

const EMPTY_TITLE = 'NOCH KEINE GESCHICHTE';
const EMPTY_DESCRIPTION = 'Beendete Zugehörigkeiten und frühere Gruppen-Admins stehen hier.';

const HISTORY_KIND_LABELS: Record<GroupHistoryKind, string> = {
  membership: 'Zugehörigkeit',
  admin: 'Gruppen-Admin',
};

interface OverrideHistoryPanelProps {
  pastMembers: readonly ManagedMember[];
  pastAdmins: readonly ManagedAdmin[];
}

export const OverrideHistoryPanel: FC<OverrideHistoryPanelProps> = ({
  pastMembers,
  pastAdmins,
}) => {
  const entries = toGroupHistoryEntries(pastMembers, pastAdmins);

  const rows = entries.map((entry) => {
    const kindChip = (
      <KkChip tone="neutral" size="small">
        {HISTORY_KIND_LABELS[entry.kind]}
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
    <KkEmptyState icon="archive" title={EMPTY_TITLE} description={EMPTY_DESCRIPTION} />
  ) : (
    rows
  );

  return (
    <ManagedGroupsSection title={MANAGE_GROUPS_SECTION_TITLES.history}>
      <KkPanel variant={variant}>{body}</KkPanel>
    </ManagedGroupsSection>
  );
};
