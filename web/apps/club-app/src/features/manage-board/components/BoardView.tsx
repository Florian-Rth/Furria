import { KkPanelStack } from '@furria/ui';
import type { FC } from 'react';
import { useBoardDialogs } from '../hooks/use-board-dialogs';
import type { BoardOfficeEntry } from '../manage-board-labels';
import { ArchiveBoardOfficeDialog } from './ArchiveBoardOfficeDialog';
import { BoardEmpty } from './BoardEmpty';
import { BoardOfficeFormDialog } from './BoardOfficeFormDialog';
import { BoardOfficeSection } from './BoardOfficeSection';
import { EndSeatDialog } from './EndSeatDialog';
import { OpenSeatDialog } from './OpenSeatDialog';

interface BoardViewProps {
  entries: readonly BoardOfficeEntry[];
  onCreate: () => void;
}

export const BoardView: FC<BoardViewProps> = ({ entries, onCreate }) => {
  const dialogs = useBoardDialogs(entries);

  if (entries.length === 0) {
    return <BoardEmpty onCreate={onCreate} />;
  }

  const sections = entries.map((entry) => (
    <BoardOfficeSection
      key={entry.boardOfficeId}
      entry={entry}
      onOpen={dialogs.openFor}
      onEndSeat={dialogs.openEndSeat}
    />
  ));

  const renamed = dialogs.openDialog === 'rename' ? dialogs.office : null;

  return (
    <KkPanelStack>
      {sections}
      <BoardOfficeFormDialog
        open={renamed !== null}
        editedOffice={renamed}
        onClose={dialogs.close}
        onSaved={dialogs.close}
      />
      <ArchiveBoardOfficeDialog
        office={dialogs.openDialog === 'archive' ? dialogs.office : null}
        onClose={dialogs.close}
      />
      <OpenSeatDialog
        office={dialogs.openDialog === 'open-seat' ? dialogs.office : null}
        onClose={dialogs.close}
      />
      <EndSeatDialog target={dialogs.endSeat} onClose={dialogs.close} />
    </KkPanelStack>
  );
};
