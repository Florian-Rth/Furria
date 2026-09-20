import { KkAvatar, KkButton, KkSinceRow } from '@furria/ui';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { formatIsoDay } from '@/lib/membership-labels';
import { toPersonName, toTakeBackLabel } from '../manage-keys-labels';
import type { KeyHolding } from '../schemas';

const SINCE_LABEL = 'seit';
const TAKE_BACK_LABEL = 'Zurücknehmen';

interface KeyHolderRowProps {
  holding: KeyHolding;
  onTakeBack: (keyHoldingId: number) => void;
}

export const KeyHolderRow: FC<KeyHolderRowProps> = ({ holding, onTakeBack }) => {
  const name = toPersonName(holding);

  const avatar = (
    <KkAvatar
      initials={toInitials(holding.firstName, holding.lastName)}
      size="small"
      component="span"
    />
  );

  const takeBack = (): void => {
    onTakeBack(holding.keyHoldingId);
  };

  const trailing = (
    <KkButton
      size="small"
      variant="text"
      tone="danger"
      ariaLabel={toTakeBackLabel(name)}
      onClick={takeBack}
    >
      {TAKE_BACK_LABEL}
    </KkButton>
  );

  return (
    <KkSinceRow
      avatar={avatar}
      title={name}
      sinceLabel={SINCE_LABEL}
      sinceValue={formatIsoDay(holding.sinceOn)}
      trailing={trailing}
    />
  );
};
