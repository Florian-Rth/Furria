import { KkButton } from '@furria/ui/KkButton';
import type { KkIconName } from '@furria/ui/KkIcon';
import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkWishChip } from '@furria/ui/KkWishChip';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { LineKey } from '@/features/running-order/schemas';
import { usePlanner } from '../planner-context';
import {
  REMOVE_WISH_LABEL,
  TODAY_SWITCH_OFF,
  TODAY_SWITCH_ON,
  toWishLabel,
  toWishStateLabel,
  UNBRACKET_LABEL,
  UNPIN_LABEL,
  wishIconOf,
} from '../planner-copy';
import type { LineWish } from '../planner-wishes';

interface PlannerWishLineProps {
  wish: LineWish;
  lineKey: LineKey;
  actId: number | null;
}

const ACTION_ICONS: Record<Exclude<LineWish['source'], 'actWish'>, KkIconName> = {
  pin: 'pinFilled',
  block: 'unblock',
  rule: 'close',
};

const actionLabelOf = (wish: LineWish): string => {
  switch (wish.source) {
    case 'pin':
      return UNPIN_LABEL;
    case 'block':
      return UNBRACKET_LABEL;
    case 'actWish':
      return wish.state === 'off' ? TODAY_SWITCH_ON : TODAY_SWITCH_OFF;
    case 'rule':
      return REMOVE_WISH_LABEL;
  }
};

export const PlannerWishLine: FC<PlannerWishLineProps> = ({ wish, lineKey, actId }) => {
  const planner = usePlanner();
  const act = (): void => {
    if (wish.source === 'pin') {
      planner.togglePinOf(lineKey);
    } else if (wish.source === 'block') {
      planner.dissolve(lineKey);
    } else if (wish.actWishId !== null) {
      planner.toggleWish(wish.actWishId);
    } else if (wish.ruleKey !== null) {
      planner.removeRuleOf(wish.ruleKey);
    }
  };

  const label = actionLabelOf(wish);
  const control =
    wish.source === 'actWish' ? (
      <KkButton size="small" variant="text" onClick={act} sx={{ flexShrink: 0 }}>
        {label}
      </KkButton>
    ) : (
      <KkIconButton label={label} icon={ACTION_ICONS[wish.source]} size="small" onClick={act} />
    );

  return (
    <Stack
      direction="row"
      sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, minWidth: 0 }}
    >
      <KkWishChip
        icon={wishIconOf(wish)}
        label={toWishLabel(wish, actId, planner.nameOf)}
        state={wish.state}
        stateLabel={toWishStateLabel(wish.state)}
      />
      {control}
    </Stack>
  );
};
