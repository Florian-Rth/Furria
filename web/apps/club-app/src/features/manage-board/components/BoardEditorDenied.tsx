import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { AccessDenied } from '@/features/session';
import { BOARD_ORIGIN } from '../manage-board-labels';

const DENIED_MESSAGE = 'Dir fehlt die Berechtigung für den Vorstand.';

interface BoardEditorDeniedProps {
  title: string;
}

export const BoardEditorDenied: FC<BoardEditorDeniedProps> = ({ title }) => (
  <KkScreen kind="fullscreen" title={title} origin={BOARD_ORIGIN}>
    <AccessDenied message={DENIED_MESSAGE} />
  </KkScreen>
);
