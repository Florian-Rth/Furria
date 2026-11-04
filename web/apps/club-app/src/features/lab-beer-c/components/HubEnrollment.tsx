import type { KkLedgerReceiptLine } from '@furria/ui/KkLedgerReceipt';
import { KkLedgerReceipt } from '@furria/ui/KkLedgerReceipt';
import type { FC } from 'react';
import { labBeerPersonOf } from '@/features/lab-beer/beer-lab-fixture';
import type { LabBeerEnrollment } from '@/features/lab-beer/beer-lab-types';
import {
  ENROLLMENT_ENDED,
  ENROLLMENT_RUNNING,
  ENROLLMENT_SINCE,
  enrollmentEndedText,
  PANE_TAB_ENROLLMENT,
} from '../ledger-copy';
import { dayOf } from '../ledger-format';

interface HubEnrollmentProps {
  enrollment: LabBeerEnrollment | null;
}

export const HubEnrollment: FC<HubEnrollmentProps> = ({ enrollment }) => {
  if (enrollment === null) {
    return null;
  }

  const endedBy = labBeerPersonOf(enrollment.endedById ?? enrollment.personId)?.firstName ?? '';
  const status =
    enrollment.endedAt === null
      ? ENROLLMENT_RUNNING
      : enrollmentEndedText(dayOf(enrollment.endedAt), endedBy);
  const lines: readonly KkLedgerReceiptLine[] = [
    { key: 'since', label: ENROLLMENT_SINCE, value: dayOf(enrollment.startedAt) },
    {
      key: 'state',
      label: enrollment.endedAt === null ? PANE_TAB_ENROLLMENT : ENROLLMENT_ENDED,
      value: status,
    },
  ];

  return <KkLedgerReceipt label={PANE_TAB_ENROLLMENT} lines={lines} />;
};
