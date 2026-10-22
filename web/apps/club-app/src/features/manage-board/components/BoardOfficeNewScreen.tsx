import type { FC } from 'react';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { BoardEditorDenied } from './BoardEditorDenied';
import { BoardOfficeEditor } from './BoardOfficeEditor';

const TITLE = 'Vorstandsfunktion hinzufügen';

export const BoardOfficeNewScreen: FC = () => {
  const { has, isUndecided } = usePermissions();

  if (!isUndecided && !has(PERMISSION_KEYS.boardManage)) {
    return <BoardEditorDenied title={TITLE} />;
  }

  return <BoardOfficeEditor entry={null} returnTo="new" />;
};
