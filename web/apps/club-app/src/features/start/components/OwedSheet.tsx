import { KkSheet } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useOwedSheet } from '../hooks/use-owed-sheet';
import type { StartBoard } from '../hooks/use-start-view';
import { OwedRow } from './OwedRow';

const SHEET_TITLE = 'Deine offenen Antworten';
const CLOSE_LABEL = 'Schließen';

interface OwedSheetProps {
  board: StartBoard;
}

export const OwedSheet: FC<OwedSheetProps> = ({ board }) => {
  const sheet = useOwedSheet(board);

  const rows = sheet.entries.map((entry) => (
    <OwedRow key={entry.calendarEntryId} entry={entry} board={board} />
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
