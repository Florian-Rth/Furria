import { KkSinceRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toLandingKey } from '@/features/write';
import type { MePasskey } from '@/lib/api/schemas';
import { formatPasskeyDay, PASSKEY_LANDING_KIND, PASSKEY_PATH } from '../account-security-labels';

const ADDED_LABEL = 'hinzugefügt am';

interface PasskeyRowProps {
  passkey: MePasskey;
  highlightedKey: string | null;
}

export const PasskeyRow: FC<PasskeyRowProps> = ({ passkey, highlightedKey }) => {
  const landing = toLandingKey(PASSKEY_LANDING_KIND, passkey.id);
  const addedOn = formatPasskeyDay(passkey.addedAt, new Date());
  const params = { passkeyId: passkey.id };
  const isHighlighted = highlightedKey === landing;

  return (
    <KkSinceRow
      icon="fingerprint"
      title={passkey.name}
      sinceLabel={ADDED_LABEL}
      sinceValue={addedOn}
      component={Link}
      to={PASSKEY_PATH}
      params={params}
      highlight={isHighlighted}
      landing={landing}
    />
  );
};
