import { KkFieldRow, KkNote, KkPanel, KkRule } from '@furria/ui';
import type { FC } from 'react';
import { formatAddress } from '@/lib/membership-labels';
import { MEMBER_SECTION_TITLES } from '../members-labels';
import type { MemberContact } from '../schemas';
import { MemberContactHidden } from './MemberContactHidden';
import { MemberContactValue } from './MemberContactValue';
import { MemberSection } from './MemberSection';

const REVEALED_NOTE = 'Du siehst das über deine Rolle — für andere Mitglieder ist es verborgen.';

interface MemberContactPanelProps {
  contact: MemberContact;
  firstName: string;
  nested?: boolean;
}

export const MemberContactPanel: FC<MemberContactPanelProps> = ({
  contact,
  firstName,
  nested = false,
}) => {
  const address = formatAddress(contact.street, contact.zip, contact.city);

  const revealedStrip =
    contact.visibility === 'revealedByPermission' ? (
      <>
        <KkNote tone="info" icon="permissions" sx={{ py: 1.75 }}>
          {REVEALED_NOTE}
        </KkNote>
        <KkRule weight="hair" />
      </>
    ) : null;

  const body =
    contact.visibility === 'hidden' ? (
      <MemberContactHidden firstName={firstName} nested={nested} />
    ) : (
      <KkPanel>
        {revealedStrip}
        <KkFieldRow label="Telefon" value={<MemberContactValue value={contact.phone} />} />
        <KkFieldRow label="E-Mail" value={<MemberContactValue value={contact.email} />} />
        <KkFieldRow label="Adresse" value={<MemberContactValue value={address} />} />
      </KkPanel>
    );

  if (nested) {
    return body;
  }

  return <MemberSection title={MEMBER_SECTION_TITLES.contact}>{body}</MemberSection>;
};
