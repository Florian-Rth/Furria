import { KkDensePanel, KkSheet } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { LinesSheetKind } from '../hooks/use-lines-sheet';
import { useLinesSheet } from '../hooks/use-lines-sheet';
import type { StartBoard } from '../hooks/use-start-view';
import { StartLine } from './StartLine';

const CLOSE_LABEL = 'Schließen';
const LINE_INSET_PULL = { mx: -1.5 } as const;

interface PanelLinesSheetProps {
  kind: LinesSheetKind;
  board: StartBoard;
}

export const PanelLinesSheet: FC<PanelLinesSheetProps> = ({ kind, board }) => {
  const sheet = useLinesSheet(kind, board);

  const lines = sheet.rows.map((row) => (
    <StartLine
      key={row.line.key}
      line={row.line}
      dimmed={row.dimmed}
      onTouch={board.touch}
      onQuiet={board.quiet}
    />
  ));

  return (
    <KkSheet id={sheet.sheetId} title={sheet.title} closeLabel={CLOSE_LABEL}>
      <KkSheet.Body>
        <Box sx={LINE_INSET_PULL}>
          <KkDensePanel.Lines>{lines}</KkDensePanel.Lines>
        </Box>
      </KkSheet.Body>
    </KkSheet>
  );
};
