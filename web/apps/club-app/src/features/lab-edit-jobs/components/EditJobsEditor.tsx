import type { StudioScreen } from '@furria/studio/studio-screen';
import { useActStudioStage } from '@furria/studio/use-act-studio-stage';
import { KkVisuallyHidden } from '@furria/ui/KkVisuallyHidden';
import type { FC } from 'react';
import type { EjVersions } from '../hooks/use-ej-versions';
import { softScreenOf } from '../soft-screen';
import { EjDeskView } from './EjDeskView';
import { EjPhoneView } from './EjPhoneView';

interface EditJobsEditorProps {
  title: string;
  screen: StudioScreen;
  versions: EjVersions;
}

export const EditJobsEditor: FC<EditJobsEditorProps> = ({ title, screen, versions }) => {
  const soft = softScreenOf(screen);
  const editor = useActStudioStage(soft);
  const view =
    soft.editor === 'desk' ? (
      <EjDeskView screen={soft} editor={editor} versions={versions} />
    ) : (
      <EjPhoneView screen={soft} editor={editor} versions={versions} title={title} />
    );

  return (
    <>
      <KkVisuallyHidden component="h1">{title}</KkVisuallyHidden>
      {view}
    </>
  );
};
