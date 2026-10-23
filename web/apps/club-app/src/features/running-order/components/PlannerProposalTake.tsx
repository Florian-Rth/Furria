import { KkIconButton } from '@furria/ui/KkIconButton';
import type { FC } from 'react';
import type { LineKey } from '@/features/running-order/schemas';
import { usePlanner } from '../planner-context';
import { ACCEPT_LABEL } from '../planner-copy';

interface PlannerProposalTakeProps {
  lineKey: LineKey;
}

export const PlannerProposalTake: FC<PlannerProposalTakeProps> = ({ lineKey }) => {
  const { suggestion } = usePlanner();
  const accept = (): void => {
    suggestion.acceptOne(lineKey);
  };

  return (
    <KkIconButton
      label={ACCEPT_LABEL}
      icon="check"
      size="small"
      disabled={suggestion.isLoading}
      onClick={accept}
    />
  );
};
