import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { UPLOAD_HELP_COPY, UPLOAD_HELP_SPOTS } from '../upload-help-copy';
import { UploadHelpPickPreview } from './UploadHelpPickPreview';
import { UploadHelpProgressPreview } from './UploadHelpProgressPreview';

export const GalleryUploadHelp: FC = () => (
  <ScreenHelp>
    <KkHelp.Hint>
      <KkHelp.Preview>
        <UploadHelpPickPreview />
      </KkHelp.Preview>
      <KkHelp.Title>{UPLOAD_HELP_COPY.pick.title}</KkHelp.Title>
      <KkHelp.Text>{UPLOAD_HELP_COPY.pick.text}</KkHelp.Text>
      <KkHelp.Text>{UPLOAD_HELP_COPY.pick.formats}</KkHelp.Text>
      <ScreenHelpShow spot={UPLOAD_HELP_SPOTS.pick} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{UPLOAD_HELP_COPY.target.title}</KkHelp.Title>
      <KkHelp.Text>{UPLOAD_HELP_COPY.target.text}</KkHelp.Text>
      <ScreenHelpShow spot={UPLOAD_HELP_SPOTS.status} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{UPLOAD_HELP_COPY.background.title}</KkHelp.Title>
      <KkHelp.Text>{UPLOAD_HELP_COPY.background.text}</KkHelp.Text>
      <KkHelp.Text>{UPLOAD_HELP_COPY.background.open}</KkHelp.Text>
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Preview>
        <UploadHelpProgressPreview />
      </KkHelp.Preview>
      <KkHelp.Title>{UPLOAD_HELP_COPY.progress.title}</KkHelp.Title>
      <KkHelp.Text>{UPLOAD_HELP_COPY.progress.text}</KkHelp.Text>
      <KkHelp.Text>{UPLOAD_HELP_COPY.progress.retry}</KkHelp.Text>
      <KkHelp.Text>{UPLOAD_HELP_COPY.progress.actions}</KkHelp.Text>
    </KkHelp.Hint>
  </ScreenHelp>
);
