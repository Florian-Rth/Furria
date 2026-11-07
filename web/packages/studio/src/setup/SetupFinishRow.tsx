import { SETUP_FINISH_OPEN } from '@furria/studio/step-setup-copy';
import type { FinishRow } from '@furria/studio/use-setup-finish';
import { KkButton } from '@furria/ui/KkButton';
import { KkSetupSummary } from '@furria/ui/KkSetupSummary';
import type { FC } from 'react';

interface SetupFinishRowProps {
  row: FinishRow;
}

export const SetupFinishRow: FC<SetupFinishRowProps> = ({ row }) => {
  const open = (
    <KkButton variant="outlined" size="small" ariaLabel={row.title} onClick={row.press}>
      {SETUP_FINISH_OPEN}
    </KkButton>
  );

  return <KkSetupSummary title={row.title} meta={row.meta} action={open} />;
};
