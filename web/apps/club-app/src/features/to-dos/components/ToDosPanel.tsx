import { KkPanel, KkPanelFold, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import type { ToDosBoardView } from '../hooks/use-to-dos-board';
import { TO_DOS_PANEL_TITLE } from '../to-do-board';
import { ToDoRow } from './ToDoRow';

interface ToDosPanelProps {
  view: ToDosBoardView;
}

export const ToDosPanel: FC<ToDosPanelProps> = ({ view }) => {
  const { board, toggleSeen } = view;

  const openRows = board.open.map((row) => (
    <ToDoRow key={row.kind} row={row} onToggleSeen={toggleSeen} />
  ));

  const seenRows = board.seen.map((row) => (
    <ToDoRow key={row.kind} row={row} onToggleSeen={toggleSeen} />
  ));

  const seenFold =
    seenRows.length === 0 ? null : (
      <KkPanelFold label={board.seenLabel} flag={board.seenFlag}>
        {seenRows}
      </KkPanelFold>
    );

  return (
    <KkPanelSection title={TO_DOS_PANEL_TITLE}>
      <KkPanel>
        {openRows}
        {seenFold}
      </KkPanel>
    </KkPanelSection>
  );
};
