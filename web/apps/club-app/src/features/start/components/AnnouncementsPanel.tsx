import { KkDensePanel } from '@furria/ui';
import type { FC } from 'react';
import { useAnnouncementsPanel } from '../hooks/use-announcements-panel';
import type { StartBoard } from '../hooks/use-start-view';
import type { StartPanelOf } from '../start-board';
import { AnnouncementLine } from './AnnouncementLine';

const HEAD_ID = 'start-announcements-head';
const LABEL = 'AUSHÄNGE';

interface AnnouncementsPanelProps {
  panel: StartPanelOf<'announcements'>;
  board: StartBoard;
}

export const AnnouncementsPanel: FC<AnnouncementsPanelProps> = ({ panel, board }) => {
  const { rows, receipt, foot } = useAnnouncementsPanel(panel, board);

  const lines = rows.map((row) => <AnnouncementLine key={row.line.key} row={row} />);

  const footLine =
    foot === null ? null : <KkDensePanel.Foot label={foot.label} onClick={foot.open} />;

  return (
    <KkDensePanel material="own" labelledBy={HEAD_ID}>
      <KkDensePanel.Head id={HEAD_ID} label={LABEL} receipt={receipt} />
      <KkDensePanel.Lines>{lines}</KkDensePanel.Lines>
      {footLine}
    </KkDensePanel>
  );
};
