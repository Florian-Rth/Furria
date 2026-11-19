import type { FC } from 'react';
import { AccessDenied } from '@/features/session/components/AccessDenied';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import { useIntakeQuery } from '../api';
import { DENIED_MESSAGE, DETAIL_ERROR_TITLE, toIntakeErrorMessage } from '../intake-labels';
import { IntakeDetailSkeleton } from './IntakeDetailSkeleton';
import { IntakeLoadError } from './IntakeLoadError';
import { IntakeNotFound } from './IntakeNotFound';

interface IntakeHoldProps {
  intakeId: number | null;
}

export const IntakeHold: FC<IntakeHoldProps> = ({ intakeId }) => {
  const intake = useIntakeQuery(intakeId);
  const errorMessage = toIntakeErrorMessage(intake.error);

  const reload = (): void => {
    void intake.refetch();
  };

  if (intakeId === null || isNotFoundError(intake.error)) {
    return <IntakeNotFound />;
  }
  if (isForbiddenError(intake.error)) {
    return <AccessDenied message={DENIED_MESSAGE} />;
  }
  if (errorMessage !== null) {
    return <IntakeLoadError title={DETAIL_ERROR_TITLE} message={errorMessage} onRetry={reload} />;
  }

  return <IntakeDetailSkeleton />;
};
