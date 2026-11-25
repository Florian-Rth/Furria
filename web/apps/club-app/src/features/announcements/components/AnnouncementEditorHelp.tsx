import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { ANNOUNCEMENTS_HELP_COPY, ANNOUNCEMENTS_HELP_SPOTS } from '../announcements-help-copy';
import type { AnnouncementEditorHelpViewer } from '../hooks/use-announcement-editor-help-viewer';

interface AnnouncementEditorHelpProps {
  viewer: AnnouncementEditorHelpViewer;
}

export const AnnouncementEditorHelp: FC<AnnouncementEditorHelpProps> = ({ viewer }) => {
  const saveText = viewer.isEditing
    ? ANNOUNCEMENTS_HELP_COPY.save.editText
    : ANNOUNCEMENTS_HELP_COPY.save.newText;
  const clubGroup = viewer.reachesClubGroup ? (
    <KkHelp.Text>{ANNOUNCEMENTS_HELP_COPY.notify.clubGroup}</KkHelp.Text>
  ) : null;
  const notify = viewer.notifies ? (
    <KkHelp.Hint>
      <KkHelp.Title>{ANNOUNCEMENTS_HELP_COPY.notify.title}</KkHelp.Title>
      <KkHelp.Text>{ANNOUNCEMENTS_HELP_COPY.notify.text}</KkHelp.Text>
      {clubGroup}
    </KkHelp.Hint>
  ) : null;
  const withdraw = viewer.isEditing ? (
    <KkHelp.Hint>
      <KkHelp.Title>{ANNOUNCEMENTS_HELP_COPY.withdraw.title}</KkHelp.Title>
      <KkHelp.Text>{ANNOUNCEMENTS_HELP_COPY.withdraw.text}</KkHelp.Text>
    </KkHelp.Hint>
  ) : null;

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Title>{ANNOUNCEMENTS_HELP_COPY.content.title}</KkHelp.Title>
        <KkHelp.Text>{ANNOUNCEMENTS_HELP_COPY.content.text}</KkHelp.Text>
        <KkHelp.Text>{ANNOUNCEMENTS_HELP_COPY.content.validUntil}</KkHelp.Text>
        <KkHelp.Text>{saveText}</KkHelp.Text>
        <ScreenHelpShow spot={ANNOUNCEMENTS_HELP_SPOTS.content} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{ANNOUNCEMENTS_HELP_COPY.mention.title}</KkHelp.Title>
        <KkHelp.Text>{ANNOUNCEMENTS_HELP_COPY.mention.text}</KkHelp.Text>
        <KkHelp.Text>{ANNOUNCEMENTS_HELP_COPY.mention.label}</KkHelp.Text>
      </KkHelp.Hint>
      {notify}
      <KkHelp.Hint>
        <KkHelp.Title>{ANNOUNCEMENTS_HELP_COPY.addOns.title}</KkHelp.Title>
        <KkHelp.Text>{ANNOUNCEMENTS_HELP_COPY.addOns.text}</KkHelp.Text>
        <KkHelp.Text>{ANNOUNCEMENTS_HELP_COPY.addOns.borrow}</KkHelp.Text>
        <ScreenHelpShow spot={ANNOUNCEMENTS_HELP_SPOTS.editorAddOns} />
      </KkHelp.Hint>
      {withdraw}
    </ScreenHelp>
  );
};
