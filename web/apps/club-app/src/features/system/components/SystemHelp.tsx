import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import type { SystemHelpViewer } from '../hooks/use-system-help-viewer';
import { SYSTEM_HELP_COPY, SYSTEM_HELP_SPOTS } from '../system-help-copy';
import { SystemHelpLevelPreview } from './SystemHelpLevelPreview';

interface SystemHelpProps {
  viewer: SystemHelpViewer;
}

export const SystemHelp: FC<SystemHelpProps> = ({ viewer }) => {
  const claimWindow = viewer.managesClaimWindow ? (
    <KkHelp.Hint>
      <KkHelp.Title>{SYSTEM_HELP_COPY.claimWindow.title}</KkHelp.Title>
      <KkHelp.Text>{SYSTEM_HELP_COPY.claimWindow.text}</KkHelp.Text>
      <ScreenHelpShow spot={SYSTEM_HELP_SPOTS.claimWindow} />
    </KkHelp.Hint>
  ) : null;

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Title>{SYSTEM_HELP_COPY.board.title}</KkHelp.Title>
        <KkHelp.Text>{SYSTEM_HELP_COPY.board.text}</KkHelp.Text>
        <KkHelp.Text>{SYSTEM_HELP_COPY.board.open}</KkHelp.Text>
        <KkHelp.Text>{SYSTEM_HELP_COPY.board.live}</KkHelp.Text>
        <ScreenHelpShow spot={SYSTEM_HELP_SPOTS.board} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Preview>
          <SystemHelpLevelPreview />
        </KkHelp.Preview>
        <KkHelp.Title>{SYSTEM_HELP_COPY.areas.title}</KkHelp.Title>
        <KkHelp.Text>{SYSTEM_HELP_COPY.areas.text}</KkHelp.Text>
        <KkHelp.Text>{SYSTEM_HELP_COPY.areas.open}</KkHelp.Text>
        <ScreenHelpShow spot={SYSTEM_HELP_SPOTS.areas} />
      </KkHelp.Hint>
      {claimWindow}
      <KkHelp.Hint>
        <KkHelp.Title>{SYSTEM_HELP_COPY.whatsApp.title}</KkHelp.Title>
        <KkHelp.Text>{SYSTEM_HELP_COPY.whatsApp.text}</KkHelp.Text>
        <ScreenHelpShow spot={SYSTEM_HELP_SPOTS.whatsApp} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{SYSTEM_HELP_COPY.program.title}</KkHelp.Title>
        <KkHelp.Text>{SYSTEM_HELP_COPY.program.text}</KkHelp.Text>
        <ScreenHelpShow spot={SYSTEM_HELP_SPOTS.program} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{SYSTEM_HELP_COPY.testPush.title}</KkHelp.Title>
        <KkHelp.Text>{SYSTEM_HELP_COPY.testPush.text}</KkHelp.Text>
        <ScreenHelpShow spot={SYSTEM_HELP_SPOTS.testPush} />
      </KkHelp.Hint>
    </ScreenHelp>
  );
};
