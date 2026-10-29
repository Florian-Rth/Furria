import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import { usePlanner } from '../planner-context';
import { EVENING_WISHES_TITLE, NONE } from '../planner-copy';
import { PlannerDetailSection } from './PlannerDetailSection';
import { PlannerEveningWishLine } from './PlannerEveningWishLine';

interface PlannerEveningWishesProps {
  action?: ReactNode;
}

export const PlannerEveningWishes: FC<PlannerEveningWishesProps> = ({ action }) => {
  const planner = usePlanner();
  const rows = planner.eveningWishes.map((wish) => (
    <PlannerEveningWishLine key={wish.id} wish={wish} />
  ));

  const content =
    rows.length === 0 ? (
      <KkText variant="body2" tone="secondary">
        {NONE}
      </KkText>
    ) : (
      <Stack sx={{ gap: 0.5, minWidth: 0 }}>{rows}</Stack>
    );

  return (
    <PlannerDetailSection title={EVENING_WISHES_TITLE} action={action}>
      {content}
    </PlannerDetailSection>
  );
};
