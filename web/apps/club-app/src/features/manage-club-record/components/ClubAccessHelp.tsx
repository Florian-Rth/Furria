import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { CLUB_ACCESS_HELP_COPY, CLUB_EDITOR_HELP_SPOTS } from '../club-record-help-copy';
import { ClubAccessHelpAgePreview } from './ClubAccessHelpAgePreview';

export const ClubAccessHelp: FC = () => (
  <ScreenHelp>
    <KkHelp.Hint>
      <KkHelp.Preview>
        <ClubAccessHelpAgePreview />
      </KkHelp.Preview>
      <KkHelp.Title>{CLUB_ACCESS_HELP_COPY.age.title}</KkHelp.Title>
      <KkHelp.Text>{CLUB_ACCESS_HELP_COPY.age.text}</KkHelp.Text>
      <KkHelp.Text>{CLUB_ACCESS_HELP_COPY.age.change}</KkHelp.Text>
      <ScreenHelpShow spot={CLUB_EDITOR_HELP_SPOTS.age} />
    </KkHelp.Hint>
  </ScreenHelp>
);
