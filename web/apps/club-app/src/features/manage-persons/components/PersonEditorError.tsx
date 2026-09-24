import { KkButton, KkErrorState, KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { PERSONS_ORIGIN } from '../manage-persons-labels';

const ERROR_TITLE = 'PERSON NICHT GELADEN';
const RETRY_LABEL = 'Erneut laden';

interface PersonEditorErrorProps {
  title: string;
  message: string;
  onRetry: () => void;
}

export const PersonEditorError: FC<PersonEditorErrorProps> = ({ title, message, onRetry }) => (
  <KkScreen kind="fullscreen" title={title} origin={PERSONS_ORIGIN}>
    <KkErrorState
      title={ERROR_TITLE}
      description={message}
      action={<KkButton onClick={onRetry}>{RETRY_LABEL}</KkButton>}
    />
  </KkScreen>
);
