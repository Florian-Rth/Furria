import {
  KkAvatar,
  KkButton,
  KkChip,
  KkFieldRow,
  KkPanel,
  KkPanelSection,
  KkSheet,
} from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { toPeekId } from '@/lib/peek';
import { toMembershipStateChip } from '@/lib/state-chips';
import { usePeek } from '@/lib/use-peek';
import { useIsSelf } from '../hooks/use-is-self';
import {
  MEMBER_PEEK_CLOSE_LABEL,
  MEMBER_PEEK_OPEN_LABEL,
  MEMBER_SECTION_TITLES,
  toPeekAffiliationLine,
} from '../members-labels';
import type { MemberSummary } from '../schemas';
import { MemberPeekContact } from './MemberPeekContact';
import { MemberPeekValue } from './MemberPeekValue';

const MEMBER_PATH = '/members/$personId';
const HEAD_GAP = 1.5;

const toPersonId = (member: MemberSummary): number => member.personId;

interface MemberPeekSheetProps {
  members: readonly MemberSummary[];
}

export const MemberPeekSheet: FC<MemberPeekSheetProps> = ({ members }) => {
  const member = usePeek('member', members, toPersonId);
  const isSelf = useIsSelf(member?.personId ?? null);

  if (member === null) {
    return null;
  }

  const name = `${member.firstName} ${member.lastName}`;
  const state = toMembershipStateChip(member.membershipState);
  const params = { personId: String(member.personId) };

  return (
    <KkSheet
      id={toPeekId('member', member.personId)}
      title={name}
      closeLabel={MEMBER_PEEK_CLOSE_LABEL}
    >
      <KkSheet.Body>
        <Stack direction="row" sx={{ alignItems: 'center', gap: HEAD_GAP, minWidth: 0 }}>
          <KkAvatar initials={toInitials(member.firstName, member.lastName)} />
          <KkChip tone={state.tone} dot={state.dot}>
            {state.label}
          </KkChip>
        </Stack>
        <KkPanel>
          <KkFieldRow
            label={MEMBER_SECTION_TITLES.groups}
            value={<MemberPeekValue line={toPeekAffiliationLine(member.groups)} />}
          />
          <KkFieldRow
            label={MEMBER_SECTION_TITLES.roles}
            value={<MemberPeekValue line={toPeekAffiliationLine(member.roles)} />}
          />
        </KkPanel>
        <KkPanelSection title={MEMBER_SECTION_TITLES.contact}>
          <MemberPeekContact member={member} isSelf={isSelf} />
        </KkPanelSection>
      </KkSheet.Body>
      <KkSheet.Actions>
        <KkButton component={Link} to={MEMBER_PATH} params={params} fullWidth>
          {MEMBER_PEEK_OPEN_LABEL}
        </KkButton>
      </KkSheet.Actions>
    </KkSheet>
  );
};
