import { JobEditor } from '@furria/studio/JobEditor';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { FC } from 'react';
import type { ActStudio } from '@/features/acts/schemas';
import { useEditorVersions } from '../hooks/use-editor-versions';
import { EditorVersionsSection } from './EditorVersionsSection';

interface ActStudioEditorProps {
  actId: number;
  title: string;
  studio: ActStudio;
  screen: StudioScreen;
}

export const ActStudioEditor: FC<ActStudioEditorProps> = ({ actId, title, studio, screen }) => {
  const versions = useEditorVersions(actId, screen.evening?.eventId ?? null, studio);
  const versionsSection = <EditorVersionsSection versions={versions} />;

  return <JobEditor title={title} screen={screen} versions={versionsSection} />;
};
