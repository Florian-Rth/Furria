import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { PERSONS_ORIGIN } from '@/features/manage-persons/manage-persons-labels';
import { AccessDenied } from '@/features/session/components/AccessDenied';
import { DENIED_MESSAGE, GROUPS_FAILED_MESSAGE, GROUPS_FAILED_TITLE } from '../intake-labels';
import { IntakeDetailSkeleton } from './IntakeDetailSkeleton';
import { IntakeLoadError } from './IntakeLoadError';

interface IntakeScreenHoldProps {
  title: string;
  isPending: boolean;
  hasFailed: boolean;
  onRetry: () => void;
}

export const IntakeScreenHold: FC<IntakeScreenHoldProps> = ({
  title,
  isPending,
  hasFailed,
  onRetry,
}) => {
  const body = hasFailed ? (
    <IntakeLoadError
      title={GROUPS_FAILED_TITLE}
      message={GROUPS_FAILED_MESSAGE}
      onRetry={onRetry}
    />
  ) : (
    <AccessDenied message={DENIED_MESSAGE} />
  );
  const content = isPending ? <IntakeDetailSkeleton /> : body;

  return (
    <KkScreen kind="fullscreen" title={title} origin={PERSONS_ORIGIN}>
      {content}
    </KkScreen>
  );
};
