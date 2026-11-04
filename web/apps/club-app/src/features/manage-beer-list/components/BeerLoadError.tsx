import { KkButton } from '@furria/ui/KkButton';
import { KkErrorState } from '@furria/ui/KkErrorState';
import type { FC } from 'react';
import { toQueryErrorMessage } from '@/lib/query-error';
import { ERROR_TITLE, HUB_ERROR_MESSAGES, RETRY_LABEL } from '../beer-hub-copy';

interface BeerLoadErrorProps {
  error: Error;
  onRetry: () => void;
}

export const BeerLoadError: FC<BeerLoadErrorProps> = ({ error, onRetry }) => {
  const message = toQueryErrorMessage(error, HUB_ERROR_MESSAGES) ?? HUB_ERROR_MESSAGES.unexpected;
  const retry = <KkButton onClick={onRetry}>{RETRY_LABEL}</KkButton>;

  return <KkErrorState title={ERROR_TITLE} description={message} action={retry} />;
};
