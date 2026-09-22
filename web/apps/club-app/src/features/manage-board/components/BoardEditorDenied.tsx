import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { AccessDenied } from '@/features/session';
import { BOARD_ORIGIN } from '../manage-board-labels';

const DENIED_MESSAGE = 'Der Vorstand ist an eine Rolle gebunden. Du hast sie gerade nicht.';

interface BoardEditorDeniedProps {
  title: string;
}

export const BoardEditorDenied: FC<BoardEditorDeniedProps> = ({ title }) => (
  <KkScreen kind="fullscreen" title={title} origin={BOARD_ORIGIN}>
    <AccessDenied message={DENIED_MESSAGE} />
  </KkScreen>
);
