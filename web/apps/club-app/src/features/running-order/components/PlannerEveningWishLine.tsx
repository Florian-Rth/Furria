import { KkButton } from '@furria/ui/KkButton';
import { KkWishChip } from '@furria/ui/KkWishChip';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { usePlanner } from '../planner-context';
import { REMOVE_WISH_LABEL, toEveningWishLabel, toWishStateLabel } from '../planner-copy';
import type { LineWish } from '../planner-wishes';

interface PlannerEveningWishLineProps {
  wish: LineWish;
}

export const PlannerEveningWishLine: FC<PlannerEveningWishLineProps> = ({ wish }) => {
  const planner = usePlanner();
  const remove = (): void => {
    if (wish.ruleKey !== null) {
      planner.removeRuleOf(wish.ruleKey);
    }
  };

  return (
    <Stack
      direction="row"
      sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, minWidth: 0 }}
    >
      <KkWishChip
        icon="wish"
        label={toEveningWishLabel(wish.actKind, wish.strength)}
        state={wish.state}
        stateLabel={toWishStateLabel(wish.state)}
      />
      <KkButton size="small" variant="text" onClick={remove}>
        {REMOVE_WISH_LABEL}
      </KkButton>
    </Stack>
  );
};
