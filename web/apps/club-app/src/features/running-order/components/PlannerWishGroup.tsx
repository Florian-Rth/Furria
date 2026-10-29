import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkNumberedGroupHead } from '@furria/ui/KkNumberedGroupHead';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { DraftLine } from '@/features/running-order/types';
import { usePlanner } from '../planner-context';
import { toAddActWishLabel, toWishGroupMeta } from '../planner-copy';
import { lineWishesOf, wishTallyOf } from '../planner-wishes';
import { PlannerWishForm } from './PlannerWishForm';
import { PlannerWishLine } from './PlannerWishLine';

interface PlannerWishGroupProps {
  line: DraftLine;
  number: number | null;
  adding: boolean;
  onToggleAdding: () => void;
}

export const PlannerWishGroup: FC<PlannerWishGroupProps> = ({
  line,
  number,
  adding,
  onToggleAdding,
}) => {
  const planner = usePlanner();
  const wishes = lineWishesOf(planner.draft, planner.findings, line.key);
  const rows = wishes.map((wish) => (
    <PlannerWishLine key={wish.id} wish={wish} lineKey={line.key} actId={line.act.actId} />
  ));
  const form = adding ? <PlannerWishForm line={line} /> : null;
  const body =
    rows.length === 0 && form === null ? null : (
      <Stack sx={{ gap: 0.5, pl: 5.25, pb: 0.75, minWidth: 0 }}>
        {rows}
        {form}
      </Stack>
    );
  const label = toAddActWishLabel(line.act.name);
  const meta = toWishGroupMeta(wishTallyOf(wishes));
  const numberText = number === null ? null : String(number);
  const toggle = (
    <KkIconButton label={label} icon="add" size="small" pressed={adding} onClick={onToggleAdding} />
  );

  return (
    <Stack component="li" sx={{ minWidth: 0 }}>
      <KkNumberedGroupHead
        number={numberText}
        title={line.act.name}
        meta={meta}
        trailing={toggle}
      />
      {body}
    </Stack>
  );
};
