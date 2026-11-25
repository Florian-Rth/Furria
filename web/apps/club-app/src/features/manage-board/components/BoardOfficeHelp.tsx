import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { BOARD_HELP_COPY } from '../board-help-copy';
import type { BoardHelpViewer } from '../hooks/use-board-help-viewer';

interface BoardOfficeHelpProps {
  viewer: BoardHelpViewer;
}

export const BoardOfficeHelp: FC<BoardOfficeHelpProps> = ({ viewer }) => {
  const roleLimit = viewer.managesRoles ? null : (
    <KkHelp.Text>{BOARD_HELP_COPY.open.role}</KkHelp.Text>
  );

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Title>{BOARD_HELP_COPY.seats.title}</KkHelp.Title>
        <KkHelp.Text>{BOARD_HELP_COPY.seats.text}</KkHelp.Text>
        <KkHelp.Text>{BOARD_HELP_COPY.seats.seat}</KkHelp.Text>
        {roleLimit}
        <KkHelp.Text>{BOARD_HELP_COPY.seats.history}</KkHelp.Text>
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{BOARD_HELP_COPY.settings.title}</KkHelp.Title>
        <KkHelp.Text>{BOARD_HELP_COPY.settings.text}</KkHelp.Text>
        <KkHelp.Text>{BOARD_HELP_COPY.settings.role}</KkHelp.Text>
        <KkHelp.Text>{BOARD_HELP_COPY.settings.edit}</KkHelp.Text>
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{BOARD_HELP_COPY.archive.title}</KkHelp.Title>
        <KkHelp.Text>{BOARD_HELP_COPY.archive.text}</KkHelp.Text>
        <KkHelp.Text>{BOARD_HELP_COPY.archive.restore}</KkHelp.Text>
      </KkHelp.Hint>
    </ScreenHelp>
  );
};
