import { KkChip, KkEmptyState, KkFactRow, KkPanel, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import { GROUP_SECTION_TITLES } from '@/lib/group-sections';
import type { HubHistoryKind } from '../group-hub-labels';
import { toHistoryEntries } from '../group-hub-labels';
import type { HubAdmin, HubMember } from '../schemas';

const NO_HISTORY_TITLE = 'NOCH KEINE GESCHICHTE';
const NO_HISTORY_DESCRIPTION = 'Beendete Zugehörigkeiten und frühere Gruppen-Admins stehen hier.';
const HISTORY_META = 'nur für Gruppen-Admins';

const HISTORY_KIND_LABELS: Record<HubHistoryKind, string> = {
  membership: 'Zugehörigkeit',
  admin: 'Gruppen-Admin',
};

interface HubHistoryPanelProps {
  pastMembers: readonly HubMember[];
  pastAdmins: readonly HubAdmin[];
}

export const HubHistoryPanel: FC<HubHistoryPanelProps> = ({ pastMembers, pastAdmins }) => {
  const entries = toHistoryEntries(pastMembers, pastAdmins);

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
    <KkEmptyState title={NO_HISTORY_TITLE} description={NO_HISTORY_DESCRIPTION} />
  ) : (
    rows
  );

  return (
    <KkPanelSection title={GROUP_SECTION_TITLES.history} meta={HISTORY_META}>
      <KkPanel variant={variant}>{body}</KkPanel>
    </KkPanelSection>
  );
};
