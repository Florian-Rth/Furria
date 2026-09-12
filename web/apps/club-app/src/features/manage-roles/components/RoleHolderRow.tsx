import { KkButton, KkSinceRow } from '@furria/ui';
import type { FC } from 'react';
import { toHolderSinceValue, toPersonName } from '../manage-roles-labels';
import type { RoleHolder } from '../schemas';

const SINCE_LABEL = 'seit';
const END_LABEL = 'Beenden';

interface RoleHolderRowProps {
  holder: RoleHolder;
  onEnd: (roleHoldingId: number) => void;
}

export const RoleHolderRow: FC<RoleHolderRowProps> = ({ holder, onEnd }) => {
  const end = (): void => {
    onEnd(holder.roleHoldingId);
  };

  const trailing = (
    <KkButton size="small" variant="outlined" tone="danger" onClick={end}>
      {END_LABEL}
    </KkButton>
  );

  return (
    <KkSinceRow
      icon="person"
      title={toPersonName(holder)}
      sinceLabel={SINCE_LABEL}
      sinceValue={toHolderSinceValue(holder)}
      trailing={trailing}
    />
  );
};
