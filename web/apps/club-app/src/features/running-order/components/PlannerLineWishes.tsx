import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { DraftLine } from '@/features/running-order/types';
import { usePlanner } from '../planner-context';
import { WISHES_TITLE } from '../planner-copy';
import { lineWishesOf } from '../planner-wishes';
import { PlannerDetailSection } from './PlannerDetailSection';
import { PlannerWishForm } from './PlannerWishForm';
import { PlannerWishLine } from './PlannerWishLine';

interface PlannerLineWishesProps {
  line: DraftLine;
}

export const PlannerLineWishes: FC<PlannerLineWishesProps> = ({ line }) => {
  const planner = usePlanner();
  const wishes = lineWishesOf(planner.draft, planner.findings, line.key);
  const actId = line.act.actId;
  const rows = wishes.map((wish) => (
    <PlannerWishLine key={wish.id} wish={wish} lineKey={line.key} actId={actId} />
  ));
  const list = rows.length === 0 ? null : <Stack sx={{ gap: 0.5, minWidth: 0 }}>{rows}</Stack>;

  return (
    <PlannerDetailSection title={WISHES_TITLE}>
      {list}
      <PlannerWishForm line={line} />
    </PlannerDetailSection>
  );
};
