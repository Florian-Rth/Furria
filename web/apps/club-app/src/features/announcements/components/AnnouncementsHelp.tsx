import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import {
  ANNOUNCEMENTS_HELP_COPY,
  ANNOUNCEMENTS_HELP_SPOTS,
  POSTER_CHIP,
} from '../announcements-help-copy';
import type { AnnouncementsHelpViewer } from '../hooks/use-announcements-help-viewer';
import { AnnouncementsHelpBulletinPreview } from './AnnouncementsHelpBulletinPreview';

interface AnnouncementsHelpProps {
  viewer: AnnouncementsHelpViewer;
}

export const AnnouncementsHelp: FC<AnnouncementsHelpProps> = ({ viewer }) => {
  const post = viewer.mayPost ? (
    <KkHelp.Hint>
      <KkHelp.Title chip={POSTER_CHIP}>{ANNOUNCEMENTS_HELP_COPY.post.title}</KkHelp.Title>
      <KkHelp.Text>{ANNOUNCEMENTS_HELP_COPY.post.text}</KkHelp.Text>
      <KkHelp.Text>{ANNOUNCEMENTS_HELP_COPY.post.change}</KkHelp.Text>
    </KkHelp.Hint>
  ) : null;

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Title>{ANNOUNCEMENTS_HELP_COPY.list.title}</KkHelp.Title>
        <KkHelp.Text>{ANNOUNCEMENTS_HELP_COPY.list.text}</KkHelp.Text>
        <KkHelp.Text>{ANNOUNCEMENTS_HELP_COPY.list.new}</KkHelp.Text>
        <ScreenHelpShow spot={ANNOUNCEMENTS_HELP_SPOTS.current} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Preview>
          <AnnouncementsHelpBulletinPreview />
        </KkHelp.Preview>
        <KkHelp.Title>{ANNOUNCEMENTS_HELP_COPY.answers.title}</KkHelp.Title>
        <KkHelp.Text>{ANNOUNCEMENTS_HELP_COPY.answers.text}</KkHelp.Text>
        <KkHelp.Text>{ANNOUNCEMENTS_HELP_COPY.answers.edge}</KkHelp.Text>
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{ANNOUNCEMENTS_HELP_COPY.expired.title}</KkHelp.Title>
        <KkHelp.Text>{ANNOUNCEMENTS_HELP_COPY.expired.text}</KkHelp.Text>
      </KkHelp.Hint>
      {post}
    </ScreenHelp>
  );
};
