import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkWishChip } from '@furria/ui/KkWishChip';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { ActWishBody, ActWishKind } from '@/features/running-order/schemas';
import { REMOVE_WISH_LABEL, toStrengthStateLabel, toWishChipLabel } from '../acts-copy';

interface ActWishLineProps {
  wish: ActWishBody;
  onRemove: ((kind: ActWishKind) => void) | null;
}

export const ActWishLine: FC<ActWishLineProps> = ({ wish, onRemove }) => {
  const remove = (): void => {
    onRemove?.(wish.kind);
  };
  const state = wish.strength === 'must' ? 'conflict' : 'hint';
  const removal =
    onRemove === null ? null : (
      <KkIconButton label={REMOVE_WISH_LABEL} icon="close" size="small" onClick={remove} />
    );

  return (
    <Stack
      direction="row"
      sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, minWidth: 0 }}
    >
      <KkWishChip
        icon="wish"
        label={toWishChipLabel(wish.kind, wish.strength)}
        state={state}
        stateLabel={toStrengthStateLabel(wish.strength)}
        marked={false}
      />
      {removal}
    </Stack>
  );
};
