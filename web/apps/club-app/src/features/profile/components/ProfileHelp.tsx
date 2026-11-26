import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import type { ProfileHelpViewer } from '../hooks/use-profile-help-viewer';
import { PROFILE_HELP_COPY, PROFILE_HELP_SPOTS } from '../profile-help-copy';

interface ProfileHelpProps {
  viewer: ProfileHelpViewer;
}

export const ProfileHelp: FC<ProfileHelpProps> = ({ viewer }) => {
  const clubGroup = viewer.keepsClubGroup ? (
    <KkHelp.Hint>
      <KkHelp.Title>{PROFILE_HELP_COPY.clubGroup.title}</KkHelp.Title>
      <KkHelp.Text>{PROFILE_HELP_COPY.clubGroup.text}</KkHelp.Text>
      <ScreenHelpShow spot={PROFILE_HELP_SPOTS.clubGroup} />
    </KkHelp.Hint>
  ) : null;
  const beerList = viewer.isAffiliated ? (
    <KkHelp.Hint>
      <KkHelp.Title>{PROFILE_HELP_COPY.beerList.title}</KkHelp.Title>
      <KkHelp.Text>{PROFILE_HELP_COPY.beerList.text}</KkHelp.Text>
    </KkHelp.Hint>
  ) : null;
  const push = viewer.hearsPush ? (
    <KkHelp.Hint>
      <KkHelp.Title>{PROFILE_HELP_COPY.push.title}</KkHelp.Title>
      <KkHelp.Text>{PROFILE_HELP_COPY.push.text}</KkHelp.Text>
      <KkHelp.Text>{PROFILE_HELP_COPY.push.topics}</KkHelp.Text>
      <ScreenHelpShow spot={PROFILE_HELP_SPOTS.push} />
    </KkHelp.Hint>
  ) : null;

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Title>{PROFILE_HELP_COPY.contact.title}</KkHelp.Title>
        <KkHelp.Text>{PROFILE_HELP_COPY.contact.text}</KkHelp.Text>
        <ScreenHelpShow spot={PROFILE_HELP_SPOTS.contact} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{PROFILE_HELP_COPY.visibility.title}</KkHelp.Title>
        <KkHelp.Text>{PROFILE_HELP_COPY.visibility.text}</KkHelp.Text>
        <ScreenHelpShow spot={PROFILE_HELP_SPOTS.visibility} />
      </KkHelp.Hint>
      {clubGroup}
      <KkHelp.Hint>
        <KkHelp.Title>{PROFILE_HELP_COPY.club.title}</KkHelp.Title>
        <KkHelp.Text>{PROFILE_HELP_COPY.club.text}</KkHelp.Text>
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{PROFILE_HELP_COPY.signIn.title}</KkHelp.Title>
        <KkHelp.Text>{PROFILE_HELP_COPY.signIn.text}</KkHelp.Text>
        <ScreenHelpShow spot={PROFILE_HELP_SPOTS.signIn} />
      </KkHelp.Hint>
      {beerList}
      <KkHelp.Hint>
        <KkHelp.Title>{PROFILE_HELP_COPY.appearance.title}</KkHelp.Title>
        <KkHelp.Text>{PROFILE_HELP_COPY.appearance.text}</KkHelp.Text>
      </KkHelp.Hint>
      {push}
      <KkHelp.Hint>
        <KkHelp.Title>{PROFILE_HELP_COPY.signOut.title}</KkHelp.Title>
        <KkHelp.Text>{PROFILE_HELP_COPY.signOut.text}</KkHelp.Text>
      </KkHelp.Hint>
    </ScreenHelp>
  );
};
