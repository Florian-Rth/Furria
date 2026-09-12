import { KkEmptyState, KkInlineLink, KkNote, KkPanel, KkPanelSection } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { GroupAdminRow, NO_ADMINS_TITLE } from '@/features/group-detail';
import { GROUP_ADMINS_NOTE, GROUP_SECTION_TITLES, NO_ADMINS_LINE } from '@/lib/group-sections';
import type { RecruitingContactSegment } from '../groups-labels';
import { toContactPersonName, toRecruitingContactSegments } from '../groups-labels';
import type { GroupAdmin } from '../schemas';

const MEMBER_PATH = '/members/$personId';

const toSegmentKey = (segment: RecruitingContactSegment, index: number): string =>
  segment.kind === 'person' ? `person-${segment.personId}` : `text-${index}`;

interface GroupAdminsPanelProps {
  admins: readonly GroupAdmin[];
  isRecruiting: boolean;
}

export const GroupAdminsPanel: FC<GroupAdminsPanelProps> = ({ admins, isRecruiting }) => {
  const rows = admins.map((admin) => (
    <GroupAdminRow key={admin.personId} admin={admin} canManage={false} canOpenPerson />
  ));

  const isEmpty = rows.length === 0;
  const variant = isEmpty ? 'block' : 'list';

  const body = isEmpty ? (
    <KkEmptyState size="panel" title={NO_ADMINS_TITLE} description={NO_ADMINS_LINE} />
  ) : (
    rows
  );

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
