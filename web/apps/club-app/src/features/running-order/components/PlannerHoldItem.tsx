import { KkButton } from '@furria/ui/KkButton';
import { KkFindingLine } from '@furria/ui/KkFindingLine';
import type { FC } from 'react';
import { usePlanner } from '../planner-context';
import { toHoldActionLabel, toHoldText, toHoldTitle } from '../planner-copy';
import type { HoldRow } from '../planner-holds';

interface PlannerHoldItemProps {
  hold: HoldRow;
}

export const PlannerHoldItem: FC<PlannerHoldItemProps> = ({ hold }) => {
  const planner = usePlanner();
  const relax = (): void => {
    planner.suggestion.relax(hold);
  };
  const title = toHoldTitle(planner.draft, hold, planner.lineNameOf, planner.nameOf);
  const text = toHoldText(hold.held, hold.without);
  const label = toHoldActionLabel(hold.kind);
  const action = (
    <KkButton
      size="small"
      variant="outlined"
      disabled={planner.suggestion.isLoading}
      onClick={relax}
    >
      {label}
    </KkButton>
  );

  return (
    <KkFindingLine severity="conflict" title={title} text={text} action={action} actionAt="end" />
  );
};
