import {
  KkAvatar,
  KkInlineLink,
  KkMeta,
  KkNote,
  KkPanel,
  KkPanelSection,
  KkSinceRow,
} from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { GROUP_ADMINS_NOTE } from '@/lib/group-sections';
import { toInitials } from '@/lib/initials';
import { formatSinceSession } from '@/lib/membership-labels';
import type { RecruitingContactSegment } from '../groups-labels';
import {
  GROUP_SECTION_TITLES,
  NO_ADMINS_LINE,
  toContactPersonName,
  toRecruitingContactSegments,
} from '../groups-labels';
import type { GroupAdmin } from '../schemas';

const SINCE_LABEL = 'seit';
const MEMBER_PATH = '/members/$personId';

const toSegmentKey = (segment: RecruitingContactSegment, index: number): string =>
  segment.kind === 'person' ? `person-${segment.personId}` : `text-${index}`;

interface GroupAdminsPanelProps {
  admins: readonly GroupAdmin[];
  isRecruiting: boolean;
}

export const GroupAdminsPanel: FC<GroupAdminsPanelProps> = ({ admins, isRecruiting }) => {
  const rows = admins.map((admin) => {
    const meta = admin.function ?? undefined;
    const adminName = `${admin.firstName} ${admin.lastName}`;
    const avatar = (
      <KkAvatar
        initials={toInitials(admin.firstName, admin.lastName)}
        size="small"
        component="span"
      />
    );

    return (
      <KkSinceRow
        key={admin.personId}
        avatar={avatar}
        title={adminName}
        meta={meta}
        sinceLabel={SINCE_LABEL}
        sinceValue={formatSinceSession(admin.since)}
        component={Link}
        to={MEMBER_PATH}
        params={{ personId: String(admin.personId) }}
      />
    );
  });

  const body = rows.length === 0 ? <KkMeta italic>{NO_ADMINS_LINE}</KkMeta> : rows;
  const variant = rows.length === 0 ? 'block' : 'list';

  const contactSegments = toRecruitingContactSegments(admins).map((segment, index) => {
    const key = toSegmentKey(segment, index);

    if (segment.kind === 'text') {
      return <span key={key}>{segment.text}</span>;
    }

    return (
      <KkInlineLink
        key={key}
        component={Link}
        to={MEMBER_PATH}
        params={{ personId: String(segment.personId) }}
      >
        {toContactPersonName(segment)}
      </KkInlineLink>
    );
  });

  const contactNote = isRecruiting ? <KkNote icon="group">{contactSegments}</KkNote> : null;

  return (
    <KkPanelSection title={GROUP_SECTION_TITLES.admins} description={GROUP_ADMINS_NOTE}>
      <Stack sx={{ gap: 2, minWidth: 0 }}>
        <KkPanel variant={variant}>{body}</KkPanel>
        {contactNote}
      </Stack>
    </KkPanelSection>
  );
};
