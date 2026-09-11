import { KkMeta, KkNote, KkPanel, KkSinceRow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { formatSinceSession } from '@/lib/membership-labels';
import { GROUP_SECTION_TITLES, NO_ADMINS_LINE, toRecruitingContactLine } from '../groups-labels';
import type { GroupAdmin } from '../schemas';
import { GroupSection } from './GroupSection';

const SINCE_LABEL = 'seit';
const ADMIN_NOTE =
  'Gruppen-Admins pflegen die Gruppe. Sie müssen nicht selbst in der Gruppe tanzen.';

interface GroupAdminsPanelProps {
  admins: readonly GroupAdmin[];
  isRecruiting: boolean;
}

export const GroupAdminsPanel: FC<GroupAdminsPanelProps> = ({ admins, isRecruiting }) => {
  const rows = admins.map((admin) => {
    const meta = admin.function ?? undefined;
    const adminName = `${admin.firstName} ${admin.lastName}`;

    return (
      <KkSinceRow
        key={admin.personId}
        icon="role"
        tone="accent"
        title={adminName}
        meta={meta}
        sinceLabel={SINCE_LABEL}
        sinceValue={formatSinceSession(admin.since)}
      />
    );
  });

  const body = rows.length === 0 ? <KkMeta italic>{NO_ADMINS_LINE}</KkMeta> : rows;
  const variant = rows.length === 0 ? 'block' : 'list';

  const contactNote = isRecruiting ? (
    <KkNote tone="warning" icon="group">
      {toRecruitingContactLine(admins)}
    </KkNote>
  ) : null;

  return (
    <GroupSection title={GROUP_SECTION_TITLES.admins}>
      <Stack sx={{ gap: 2, minWidth: 0 }}>
        <KkPanel variant={variant}>{body}</KkPanel>
        {contactNote}
        <KkNote>{ADMIN_NOTE}</KkNote>
      </Stack>
    </GroupSection>
  );
};
