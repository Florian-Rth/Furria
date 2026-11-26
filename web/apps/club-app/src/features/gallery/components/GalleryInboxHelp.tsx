import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { GALLERY_HELP_CHIPS } from '../gallery-help-chips';
import { INBOX_HELP_COPY } from '../inbox-help-copy';

interface GalleryInboxHelpProps {
  choosesInbox: boolean;
}

export const GalleryInboxHelp: FC<GalleryInboxHelpProps> = ({ choosesInbox }) => {
  const owners = choosesInbox ? (
    <KkHelp.Hint>
      <KkHelp.Title chip={GALLERY_HELP_CHIPS.manages}>{INBOX_HELP_COPY.owners.title}</KkHelp.Title>
      <KkHelp.Text>{INBOX_HELP_COPY.owners.text}</KkHelp.Text>
    </KkHelp.Hint>
  ) : null;

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Title>{INBOX_HELP_COPY.browse.title}</KkHelp.Title>
        <KkHelp.Text>{INBOX_HELP_COPY.browse.text}</KkHelp.Text>
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{INBOX_HELP_COPY.file.title}</KkHelp.Title>
        <KkHelp.Text>{INBOX_HELP_COPY.file.text}</KkHelp.Text>
        <KkHelp.Text>{INBOX_HELP_COPY.file.baskets}</KkHelp.Text>
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{INBOX_HELP_COPY.reject.title}</KkHelp.Title>
        <KkHelp.Text>{INBOX_HELP_COPY.reject.text}</KkHelp.Text>
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{INBOX_HELP_COPY.commit.title}</KkHelp.Title>
        <KkHelp.Text>{INBOX_HELP_COPY.commit.text}</KkHelp.Text>
      </KkHelp.Hint>
      {owners}
      <KkHelp.Hint>
        <KkHelp.Title>{INBOX_HELP_COPY.keys.title}</KkHelp.Title>
        <KkHelp.Text>{INBOX_HELP_COPY.keys.text}</KkHelp.Text>
      </KkHelp.Hint>
    </ScreenHelp>
  );
};
