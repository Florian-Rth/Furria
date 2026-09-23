import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { EDITOR_DENIED_MESSAGE, PERSONS_ORIGIN } from '../manage-persons-labels';
import { PersonEditor } from './PersonEditor';
import { PersonEditorDenied } from './PersonEditorDenied';
import { PersonEditorSkeleton } from './PersonEditorSkeleton';

const TITLE = 'Person hinzufügen';

export const PersonNewScreen: FC = () => {
  const { has, isUndecided } = usePermissions();

  if (isUndecided) {
    return <PersonEditorSkeleton title={TITLE} />;
  }
  if (!has(PERMISSION_KEYS.personsManage)) {
    return (
      <PersonEditorDenied title={TITLE} origin={PERSONS_ORIGIN} message={EDITOR_DENIED_MESSAGE} />
    );
  }

  return <PersonEditor person={null} />;
};
