import { JobDeskView } from '@furria/studio/JobDeskView';
import { JobPhoneView } from '@furria/studio/JobPhoneView';
import { softScreenOf } from '@furria/studio/soft-screen';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { useActStudioStage } from '@furria/studio/use-act-studio-stage';
import { KkVisuallyHidden } from '@furria/ui/KkVisuallyHidden';
import type { FC, ReactNode } from 'react';

interface JobEditorProps {
  title: string;
  screen: StudioScreen;
  versions: ReactNode;
}

export const JobEditor: FC<JobEditorProps> = ({ title, screen, versions }) => {
  const soft = softScreenOf(screen);
  const editor = useActStudioStage(soft);
  const view =
    soft.editor === 'desk' ? (
      <JobDeskView screen={soft} editor={editor} versions={versions} />
    ) : (
      <JobPhoneView screen={soft} editor={editor} versions={versions} title={title} />
    );

  return (
    <>
      <KkVisuallyHidden component="h1">{title}</KkVisuallyHidden>
      {view}
    </>
  );
};
