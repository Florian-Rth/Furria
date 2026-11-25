import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { PROFILE_HELP_COPY, PROFILE_HELP_SPOTS } from '../profile-help-copy';

export const ProfileContactEditHelp: FC = () => (
  <ScreenHelp>
    <KkHelp.Hint>
      <KkHelp.Title>{PROFILE_HELP_COPY.edit.title}</KkHelp.Title>
      <KkHelp.Text>{PROFILE_HELP_COPY.edit.text}</KkHelp.Text>
      <KkHelp.Text>{PROFILE_HELP_COPY.edit.phone}</KkHelp.Text>
      <ScreenHelpShow spot={PROFILE_HELP_SPOTS.contactFields} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{PROFILE_HELP_COPY.portrait.title}</KkHelp.Title>
      <KkHelp.Text>{PROFILE_HELP_COPY.portrait.text}</KkHelp.Text>
    </KkHelp.Hint>
  </ScreenHelp>
);
