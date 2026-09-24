import { KkAvatar, KkSinceRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toLandingKey } from '@/features/write';
import { toInitials } from '@/lib/initials';
import { formatIsoDay } from '@/lib/membership-labels';
import { toPersonName } from '../manage-keys-labels';
import type { KeyHolding } from '../schemas';

const SINCE_LABEL = 'seit';
const HOLDING_ROUTE = '/manage/keys/holdings/$keyHoldingId';

interface KeyHolderRowProps {
  holding: KeyHolding;
  highlightedKey: string | null;
}

export const KeyHolderRow: FC<KeyHolderRowProps> = ({ holding, highlightedKey }) => {
  const name = toPersonName(holding);
  const landingKey = toLandingKey('keyHolding', holding.keyHoldingId);

  const avatar = (
    <KkAvatar
      initials={toInitials(holding.firstName, holding.lastName)}
      size="small"
      component="span"
    />
  );

  return (
    <KkSinceRow
      avatar={avatar}
      title={name}
      sinceLabel={SINCE_LABEL}
      sinceValue={formatIsoDay(holding.sinceOn)}
      component={Link}
      to={HOLDING_ROUTE}
      params={{ keyHoldingId: String(holding.keyHoldingId) }}
      highlight={highlightedKey === landingKey}
      landing={landingKey}
    />
  );
};
