import { KkSheet } from '@furria/ui';
import type { FC } from 'react';
import { useAnnouncementsSheet } from '../hooks/use-announcements-sheet';
import type { StartBoard } from '../hooks/use-start-view';
import { AnnouncementBlock } from './AnnouncementBlock';

const SHEET_TITLE = 'Neue Aushänge';
const CLOSE_LABEL = 'Schließen';

interface AnnouncementsSheetProps {
  board: StartBoard;
}

export const AnnouncementsSheet: FC<AnnouncementsSheetProps> = ({ board }) => {
  const sheet = useAnnouncementsSheet(board);

  const blocks = sheet.blocks.map((block) => (
    <AnnouncementBlock
      key={block.announcement.announcementId}
      announcement={block.announcement}
      focused={block.focused}
      ruled={block.ruled}
    />
  ));

  return (
    <KkSheet id={sheet.sheetId} title={SHEET_TITLE} closeLabel={CLOSE_LABEL}>
      <KkSheet.Body>{blocks}</KkSheet.Body>
      <KkSheet.Actions primary={sheet.action} />
    </KkSheet>
  );
};
