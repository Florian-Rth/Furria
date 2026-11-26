import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { UPLOAD_LINKS_HELP_COPY, UPLOAD_LINKS_HELP_SPOTS } from '../upload-links-help-copy';
import { UploadLinksHelpRowPreview } from './UploadLinksHelpRowPreview';

export const UploadLinksHelp: FC = () => (
  <ScreenHelp>
    <KkHelp.Hint>
      <KkHelp.Title>{UPLOAD_LINKS_HELP_COPY.create.title}</KkHelp.Title>
      <KkHelp.Text>{UPLOAD_LINKS_HELP_COPY.create.text}</KkHelp.Text>
      <ScreenHelpShow spot={UPLOAD_LINKS_HELP_SPOTS.create} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{UPLOAD_LINKS_HELP_COPY.guests.title}</KkHelp.Title>
      <KkHelp.Text>{UPLOAD_LINKS_HELP_COPY.guests.text}</KkHelp.Text>
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{UPLOAD_LINKS_HELP_COPY.inbox.title}</KkHelp.Title>
      <KkHelp.Text>{UPLOAD_LINKS_HELP_COPY.inbox.text}</KkHelp.Text>
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Preview>
        <UploadLinksHelpRowPreview />
      </KkHelp.Preview>
      <KkHelp.Title>{UPLOAD_LINKS_HELP_COPY.manage.title}</KkHelp.Title>
      <KkHelp.Text>{UPLOAD_LINKS_HELP_COPY.manage.text}</KkHelp.Text>
      <KkHelp.Text>{UPLOAD_LINKS_HELP_COPY.manage.end}</KkHelp.Text>
      <KkHelp.Text>{UPLOAD_LINKS_HELP_COPY.manage.ended}</KkHelp.Text>
      <ScreenHelpShow spot={UPLOAD_LINKS_HELP_SPOTS.open} />
    </KkHelp.Hint>
  </ScreenHelp>
);
