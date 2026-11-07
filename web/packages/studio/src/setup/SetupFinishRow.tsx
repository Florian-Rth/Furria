import { SS_FINISH_OPEN } from '@furria/studio/step-setup-copy';
import type { FinishRow } from '@furria/studio/use-setup-finish';
import { KkButton } from '@furria/ui/KkButton';
import { KkSsSummary } from '@furria/ui/KkSsSummary';
import type { FC } from 'react';

interface SetupFinishRowProps {
  row: FinishRow;
}

export const SetupFinishRow: FC<SetupFinishRowProps> = ({ row }) => {
  const open = (
    <KkButton variant="outlined" size="small" ariaLabel={row.title} onClick={row.press}>
      {SS_FINISH_OPEN}
    </KkButton>
  );

  return <KkSsSummary title={row.title} meta={row.meta} action={open} />;
};
