import { KkAvatar, KkButton, KkSinceRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { KeyHolderEntry } from '@/lib/key-holders';
import { KEY_HOLDER_SINCE_LABEL } from '@/lib/key-holders';

const MEMBER_PATH = '/members/$personId';
const CONTACT_LABEL = 'Kontaktdaten';

interface KeyHolderRowProps {
  entry: KeyHolderEntry;
}

export const KeyHolderRow: FC<KeyHolderRowProps> = ({ entry }) => {
  const params = { personId: String(entry.personId) };

  const contactLink = (
    <KkButton component={Link} to={MEMBER_PATH} params={params} variant="text" size="small">
      {CONTACT_LABEL}
    </KkButton>
  );

  return (
    <KkSinceRow
      avatar={<KkAvatar initials={entry.initials} size="small" component="span" />}
      title={entry.name}
      sinceLabel={KEY_HOLDER_SINCE_LABEL}
      sinceValue={entry.sinceValue}
      trailing={contactLink}
    />
  );
};
