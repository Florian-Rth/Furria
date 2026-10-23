import { KkButton } from '@furria/ui/KkButton';
import { KkIcon } from '@furria/ui/KkIcon';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { placedLinesOf, unplacedLinesOf } from '@/features/running-order/running-order-ops';
import { useWishBoard } from '../hooks/use-wish-board';
import { usePlanner } from '../planner-context';
import {
  ACTS_WISHES_TITLE,
  CANCEL_LABEL,
  EVENING_WISH_ARIA_LABEL,
  EVENING_WISH_LABEL,
} from '../planner-copy';
import { PlannerDetailSection } from './PlannerDetailSection';
import { PlannerEveningWishes } from './PlannerEveningWishes';
import { PlannerEveningWishForm } from './PlannerEveningWishForm';
import { PlannerWishGroup } from './PlannerWishGroup';

export const PlannerWishBoard: FC = () => {
  const planner = usePlanner();
  const board = useWishBoard();
  const placed = placedLinesOf(planner.draft).map((line, index) => ({ line, number: index + 1 }));
  const waiting = unplacedLinesOf(planner.draft).map((line) => ({ line, number: null }));
  const groups = [...placed, ...waiting].map(({ line, number }) => {
    const toggle = (): void => {
      board.toggleAdding(line.key);
    };

    return (
      <PlannerWishGroup
        key={line.key}
        line={line}
        number={number}
        adding={board.addingKey === line.key}
        onToggleAdding={toggle}
      />
    );
  });
  const eveningForm = board.eveningFormOpen ? (
    <PlannerEveningWishForm onAdded={board.closeEveningForm} />
  ) : null;
  const eveningLabel = board.eveningFormOpen ? CANCEL_LABEL : EVENING_WISH_LABEL;
  const eveningAriaLabel = board.eveningFormOpen ? CANCEL_LABEL : EVENING_WISH_ARIA_LABEL;
  const eveningIcon = <KkIcon name={board.eveningFormOpen ? 'close' : 'add'} size="small" />;
  const eveningToggle = (
    <KkButton
      size="small"
      variant="text"
      startIcon={eveningIcon}
      ariaLabel={eveningAriaLabel}
      onClick={board.toggleEveningForm}
      sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
    >
      {eveningLabel}
    </KkButton>
  );

  return (
    <Stack sx={{ gap: 2.5, minWidth: 0 }}>
      <Stack sx={{ gap: 1, minWidth: 0 }}>
        <PlannerEveningWishes action={eveningToggle} />
        {eveningForm}
      </Stack>
      <PlannerDetailSection title={ACTS_WISHES_TITLE}>
        <Stack component="ul" sx={{ listStyle: 'none', m: 0, p: 0, minWidth: 0 }}>
          {groups}
        </Stack>
      </PlannerDetailSection>
    </Stack>
  );
};
