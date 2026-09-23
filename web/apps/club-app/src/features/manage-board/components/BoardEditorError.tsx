import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { BOARD_ORIGIN } from '../manage-board-labels';
import { BoardError } from './BoardError';

const FALLBACK_TITLE = 'Vorstand';

interface BoardEditorErrorProps {
  message: string;
  onRetry: () => void;
}

export const BoardEditorError: FC<BoardEditorErrorProps> = ({ message, onRetry }) => (
  <KkScreen kind="fullscreen" title={FALLBACK_TITLE} origin={BOARD_ORIGIN}>
    <BoardError message={message} onRetry={onRetry} />
  </KkScreen>
);
