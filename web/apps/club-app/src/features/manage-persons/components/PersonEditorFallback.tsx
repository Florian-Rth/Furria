import type { FC } from 'react';
import { EDITOR_DENIED_MESSAGE, PERSONS_ORIGIN, toPersonOrigin } from '../manage-persons-labels';
import type { PersonEditorHold } from '../person-editor-gate';
import type { PersonDetails } from '../schemas';
import { PersonEditorDenied } from './PersonEditorDenied';
import { PersonEditorError } from './PersonEditorError';
import { PersonEditorNotFound } from './PersonEditorNotFound';
import { PersonEditorSkeleton } from './PersonEditorSkeleton';

interface PersonEditorFallbackProps {
  hold: PersonEditorHold<PersonDetails>;
  title: string;
  onRetry: () => void;
}

export const PersonEditorFallback: FC<PersonEditorFallbackProps> = ({ hold, title, onRetry }) => {
  if (hold.kind === 'missing') {
    return <PersonEditorNotFound />;
  }
  if (hold.kind === 'failed') {
    return <PersonEditorError title={title} message={hold.message} onRetry={onRetry} />;
  }
  if (hold.kind === 'denied') {
    const origin = hold.person === undefined ? PERSONS_ORIGIN : toPersonOrigin(hold.person);

    return <PersonEditorDenied title={title} origin={origin} message={EDITOR_DENIED_MESSAGE} />;
  }

  return <PersonEditorSkeleton title={title} />;
};
