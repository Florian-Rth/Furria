import { KkButton } from '@furria/ui/KkButton';
import { KkSsSummary } from '@furria/ui/KkSsSummary';
import type { FC } from 'react';
import type { FinishRow } from '../hooks/use-setup-finish';
import { SS_FINISH_OPEN } from '../setup-copy';

interface SsFinishRowProps {
  row: FinishRow;
}

export const SsFinishRow: FC<SsFinishRowProps> = ({ row }) => {
  const open = (
    <KkButton variant="outlined" size="small" ariaLabel={row.title} onClick={row.press}>
      {SS_FINISH_OPEN}
    </KkButton>
  );

  return <KkSsSummary title={row.title} meta={row.meta} action={open} />;
};
