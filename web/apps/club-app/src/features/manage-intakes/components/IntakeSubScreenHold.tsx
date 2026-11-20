import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkScreen } from '@furria/ui/KkScreen';
import type { FC, ReactElement } from 'react';
import { PERSONS_ORIGIN } from '@/features/manage-persons/manage-persons-labels';
import { AccessDenied } from '@/features/session/components/AccessDenied';
import { DENIED_MESSAGE, SETTLED_LINE, SETTLED_TITLE } from '../intake-labels';
import type { IntakeScreenGate } from '../intake-rules';
import { IntakeHold } from './IntakeHold';

interface IntakeSubScreenHoldProps {
  title: string;
  intakeId: number | null;
  gate: IntakeScreenGate;
}

export const IntakeSubScreenHold: FC<IntakeSubScreenHoldProps> = ({ title, intakeId, gate }) => {
  const bodies: Record<IntakeScreenGate, ReactElement> = {
    pending: <IntakeHold intakeId={intakeId} />,
    open: <IntakeHold intakeId={intakeId} />,
    settled: <KkEmptyState title={SETTLED_TITLE} description={SETTLED_LINE} />,
    denied: <AccessDenied message={DENIED_MESSAGE} />,
  };

  return (
    <KkScreen kind="fullscreen" title={title} origin={PERSONS_ORIGIN}>
      {bodies[gate]}
    </KkScreen>
  );
};
