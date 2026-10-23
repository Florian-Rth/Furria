import { KkWishChip } from '@furria/ui/KkWishChip';
import type { FC } from 'react';
import type { ActWishBody } from '@/features/running-order/schemas';
import { toStrengthStateLabel, toWishChipLabel } from '../acts-copy';

interface ActWishChipsProps {
  wishes: readonly ActWishBody[];
}

export const ActWishChips: FC<ActWishChipsProps> = ({ wishes }) => {
  const chips = wishes.map((wish) => (
    <KkWishChip
      key={wish.kind}
      icon="wish"
      label={toWishChipLabel(wish.kind, wish.strength)}
      state={wish.strength === 'must' ? 'conflict' : 'hint'}
      stateLabel={toStrengthStateLabel(wish.strength)}
      marked={false}
    />
  ));

  return <>{chips}</>;
};
