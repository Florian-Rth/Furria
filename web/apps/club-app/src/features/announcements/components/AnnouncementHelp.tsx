import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import type { AnnouncementHelpViewer } from '../announcement-help-viewer';
import { ANNOUNCEMENTS_HELP_COPY, ANNOUNCEMENTS_HELP_SPOTS } from '../announcements-help-copy';

interface AnnouncementHelpProps {
  viewer: AnnouncementHelpViewer;
}

export const AnnouncementHelp: FC<AnnouncementHelpProps> = ({ viewer }) => {
  const mentions = viewer.hasMentions ? (
    <KkHelp.Text>{ANNOUNCEMENTS_HELP_COPY.read.mentions}</KkHelp.Text>
  ) : null;
  const takenOver = viewer.hasTakenOver ? (
    <KkHelp.Text>{ANNOUNCEMENTS_HELP_COPY.answer.taken}</KkHelp.Text>
  ) : null;
  const answer = viewer.hasAddOns ? (
    <KkHelp.Hint>
      <KkHelp.Title>{ANNOUNCEMENTS_HELP_COPY.answer.title}</KkHelp.Title>
      <KkHelp.Text>{ANNOUNCEMENTS_HELP_COPY.answer.text}</KkHelp.Text>
      {takenOver}
      <ScreenHelpShow spot={ANNOUNCEMENTS_HELP_SPOTS.addOns} />
    </KkHelp.Hint>
  ) : null;
  const closing = viewer.hasAddOns ? (
    <KkHelp.Text>{ANNOUNCEMENTS_HELP_COPY.edit.close}</KkHelp.Text>
  ) : null;
  const edit = viewer.mayEdit ? (
    <KkHelp.Hint>
      <KkHelp.Title>{ANNOUNCEMENTS_HELP_COPY.edit.title}</KkHelp.Title>
      <KkHelp.Text>{ANNOUNCEMENTS_HELP_COPY.edit.text}</KkHelp.Text>
      {closing}
    </KkHelp.Hint>
  ) : null;

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Title>{ANNOUNCEMENTS_HELP_COPY.read.title}</KkHelp.Title>
        <KkHelp.Text>{ANNOUNCEMENTS_HELP_COPY.read.text}</KkHelp.Text>
        {mentions}
        <ScreenHelpShow spot={ANNOUNCEMENTS_HELP_SPOTS.text} />
      </KkHelp.Hint>
      {answer}
      {edit}
    </ScreenHelp>
  );
};
