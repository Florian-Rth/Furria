import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { BOARD_HELP_COPY, BOARD_HELP_SPOTS } from '../board-help-copy';
import type { BoardHelpViewer } from '../hooks/use-board-help-viewer';
import { BoardHelpStripPreview } from './BoardHelpStripPreview';

interface BoardHelpProps {
  viewer: BoardHelpViewer;
}

export const BoardHelp: FC<BoardHelpProps> = ({ viewer }) => {
  const roleLimit = viewer.managesRoles ? null : (
    <KkHelp.Text>{BOARD_HELP_COPY.open.role}</KkHelp.Text>
  );

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Preview>
          <BoardHelpStripPreview />
        </KkHelp.Preview>
        <KkHelp.Title>{BOARD_HELP_COPY.strip.title}</KkHelp.Title>
        <KkHelp.Text>{BOARD_HELP_COPY.strip.text}</KkHelp.Text>
        <KkHelp.Text>{BOARD_HELP_COPY.strip.next}</KkHelp.Text>
        <ScreenHelpShow spot={BOARD_HELP_SPOTS.strip} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{BOARD_HELP_COPY.open.title}</KkHelp.Title>
        <KkHelp.Text>{BOARD_HELP_COPY.open.text}</KkHelp.Text>
        <KkHelp.Text>{BOARD_HELP_COPY.open.action}</KkHelp.Text>
        {roleLimit}
        <ScreenHelpShow spot={BOARD_HELP_SPOTS.open} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{BOARD_HELP_COPY.held.title}</KkHelp.Title>
        <KkHelp.Text>{BOARD_HELP_COPY.held.text}</KkHelp.Text>
        <KkHelp.Text>{BOARD_HELP_COPY.held.archived}</KkHelp.Text>
        <ScreenHelpShow spot={BOARD_HELP_SPOTS.held} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{BOARD_HELP_COPY.settings.title}</KkHelp.Title>
        <KkHelp.Text>{BOARD_HELP_COPY.settings.text}</KkHelp.Text>
        <KkHelp.Text>{BOARD_HELP_COPY.settings.role}</KkHelp.Text>
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{BOARD_HELP_COPY.add.title}</KkHelp.Title>
        <KkHelp.Text>{BOARD_HELP_COPY.add.text}</KkHelp.Text>
      </KkHelp.Hint>
    </ScreenHelp>
  );
};
