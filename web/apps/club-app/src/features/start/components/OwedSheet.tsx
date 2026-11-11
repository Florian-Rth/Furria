import { KkSheet } from '@furria/ui/KkSheet';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useOwedSheet } from '../hooks/use-owed-sheet';
import type { StartBoard } from '../hooks/use-start-view';
import { OwedEntry } from './OwedEntry';

const SHEET_TITLE = 'Deine offenen Antworten';
const CLOSE_LABEL = 'Schließen';

interface OwedSheetProps {
  board: StartBoard;
}

export const OwedSheet: FC<OwedSheetProps> = ({ board }) => {
  const sheet = useOwedSheet(board);

  const rows = sheet.groups.map((group) => (
    <OwedEntry key={group.key} group={group} board={board} />
  ));

  return (
    <KkSheet id={sheet.sheetId} title={SHEET_TITLE} closeLabel={CLOSE_LABEL}>
      <KkSheet.Body>
        <Stack component="ul" sx={{ m: 0, p: 0, listStyle: 'none', minWidth: 0 }}>
          {rows}
        </Stack>
      </KkSheet.Body>
    </KkSheet>
  );
};
