import { KkPanel, KkPanelFold, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import { useManageToDos } from '../hooks/use-manage-to-dos';
import { TO_DOS_PANEL_TITLE } from '../manage-to-dos';
import type { ManageToDo } from '../schemas';
import { ManageToDoRow } from './ManageToDoRow';

interface ManageToDosPanelProps {
  toDos: readonly ManageToDo[];
}

export const ManageToDosPanel: FC<ManageToDosPanelProps> = ({ toDos }) => {
  const { board, toggleSeen } = useManageToDos(toDos);

  const openRows = board.open.map((row) => (
    <ManageToDoRow key={row.kind} row={row} onToggleSeen={toggleSeen} />
  ));

  const seenRows = board.seen.map((row) => (
    <ManageToDoRow key={row.kind} row={row} onToggleSeen={toggleSeen} />
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
