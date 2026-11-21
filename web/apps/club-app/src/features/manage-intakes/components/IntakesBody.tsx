import type { FC } from 'react';
import { AccessDenied } from '@/features/session/components/AccessDenied';
import { AppListSkeleton } from '@/features/session/components/AppListSkeleton';
import { isForbiddenError } from '@/lib/query-error';
import { useIntakesQuery } from '../api';
import {
  DENIED_MESSAGE,
  LIST_ERROR_TITLE,
  LOADING_LABEL,
  toIntakesErrorMessage,
} from '../intake-labels';
import { IntakeLoadError } from './IntakeLoadError';
import { IntakesView } from './IntakesView';

export const IntakesBody: FC = () => {
  const intakes = useIntakesQuery();
  const errorMessage = toIntakesErrorMessage(intakes.error);

  const reload = (): void => {
    void intakes.refetch();
  };

  if (intakes.data !== undefined) {
    return <IntakesView intakes={intakes.data.intakes} />;
  }
  if (isForbiddenError(intakes.error)) {
    return <AccessDenied message={DENIED_MESSAGE} />;
  }
  if (errorMessage !== null) {
    return <IntakeLoadError title={LIST_ERROR_TITLE} message={errorMessage} onRetry={reload} />;
  }

  return <AppListSkeleton label={LOADING_LABEL} listShape="rows" />;
};
