import { KkEmptyState, KkNote, KkPanel, KkSinceRow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { formatSinceSession } from '@/lib/membership-labels';
import { HUB_SECTION_TITLES, NO_ADMINS_LINE } from '../group-hub-labels';
import type { HubAdmin } from '../schemas';
import { HubSection } from './HubSection';

const SINCE_LABEL = 'seit';
const NO_ADMINS_TITLE = 'KEIN GRUPPEN-ADMIN';
const ADMIN_NOTE =
  'Gruppen-Admins pflegen die Gruppe. Sie müssen nicht selbst in der Gruppe tanzen.';

interface HubAdminsPanelProps {
  admins: readonly HubAdmin[];
}

export const HubAdminsPanel: FC<HubAdminsPanelProps> = ({ admins }) => {
  const rows = admins.map((admin) => {
    const adminName = `${admin.firstName} ${admin.lastName}`;
    const meta = admin.function ?? undefined;

    return (
      <KkSinceRow
        key={admin.groupAdminId}
        icon="role"
        tone="accent"
        title={adminName}
        meta={meta}
        sinceLabel={SINCE_LABEL}
        sinceValue={formatSinceSession(admin.since)}
      />
    );
  });

  const isEmpty = rows.length === 0;
  const variant = isEmpty ? 'block' : 'list';

  const body = isEmpty ? (
    <KkEmptyState icon="role" title={NO_ADMINS_TITLE} description={NO_ADMINS_LINE} />
  ) : (
    rows
  );

  return (
    <HubSection title={HUB_SECTION_TITLES.admins}>
      <Stack sx={{ gap: 2, minWidth: 0 }}>
        <KkPanel variant={variant}>{body}</KkPanel>
        <KkNote>{ADMIN_NOTE}</KkNote>
      </Stack>
    </HubSection>
  );
};
