import { KkButton, KkErrorState, KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { NEWS_ORIGIN } from '@/features/session';
import { EDITOR_ERROR_TITLE, NEW_POST_TITLE } from '../../editor-copy';
import { HUB_RETRY } from '../../hub-copy';

interface NewsEditorFailureProps {
  message: string;
  onRetry: () => void;
}

export const NewsEditorFailure: FC<NewsEditorFailureProps> = ({ message, onRetry }) => {
  const retry = <KkButton onClick={onRetry}>{HUB_RETRY}</KkButton>;

  return (
    <KkScreen kind="working" title={NEW_POST_TITLE} origin={NEWS_ORIGIN}>
      <KkErrorState title={EDITOR_ERROR_TITLE} description={message} action={retry} />
    </KkScreen>
  );
};
