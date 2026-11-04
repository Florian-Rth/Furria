import { KkButton } from '@furria/ui/KkButton';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { labBeerPersonOf } from '@/features/lab-beer/beer-lab-fixture';
import type { LabBeerEnrollment } from '@/features/lab-beer/beer-lab-types';
import { formerText, REJOIN_LABEL } from '../ledger-copy';
import { dayOf } from '../ledger-format';

interface LedgerFormerLineProps {
  enrollment: LabBeerEnrollment;
  onRejoin: () => void;
}

export const LedgerFormerLine: FC<LedgerFormerLineProps> = ({ enrollment, onRejoin }) => {
  const endedAt = enrollment.endedAt ?? enrollment.startedAt;
  const endedBy = labBeerPersonOf(enrollment.endedById ?? enrollment.personId);
  const byName = endedBy === null ? '' : endedBy.firstName;
  const text = formerText(dayOf(endedAt), byName);

  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
      <KkText variant="caption" tone="secondary" sx={{ flex: 1, minWidth: 0 }}>
        {text}
      </KkText>
      <KkButton variant="text" size="small" onClick={onRejoin}>
        {REJOIN_LABEL}
      </KkButton>
    </Stack>
  );
};
