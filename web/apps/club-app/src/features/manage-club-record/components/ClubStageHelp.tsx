import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { CLUB_EDITOR_HELP_SPOTS, CLUB_STAGE_HELP_COPY } from '../club-record-help-copy';

export const ClubStageHelp: FC = () => (
  <ScreenHelp>
    <KkHelp.Hint>
      <KkHelp.Title>{CLUB_STAGE_HELP_COPY.size.title}</KkHelp.Title>
      <KkHelp.Text>{CLUB_STAGE_HELP_COPY.size.text}</KkHelp.Text>
      <ScreenHelpShow spot={CLUB_EDITOR_HELP_SPOTS.stageSize} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{CLUB_STAGE_HELP_COPY.artwork.title}</KkHelp.Title>
      <KkHelp.Text>{CLUB_STAGE_HELP_COPY.artwork.text}</KkHelp.Text>
      <KkHelp.Text>{CLUB_STAGE_HELP_COPY.artwork.preview}</KkHelp.Text>
      <ScreenHelpShow spot={CLUB_EDITOR_HELP_SPOTS.stageArtwork} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{CLUB_STAGE_HELP_COPY.use.title}</KkHelp.Title>
      <KkHelp.Text>{CLUB_STAGE_HELP_COPY.use.text}</KkHelp.Text>
    </KkHelp.Hint>
  </ScreenHelp>
);
