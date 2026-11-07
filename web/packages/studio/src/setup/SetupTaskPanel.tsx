import { SetupMoreDrawer } from '@furria/studio/SetupMoreDrawer';
import { SetupToolButton } from '@furria/studio/SetupToolButton';
import type { SetupTask } from '@furria/studio/setup-task';
import { SETUP_MORE, SETUP_TASK } from '@furria/studio/step-setup-copy';
import { useDrawer } from '@furria/studio/use-drawer';
import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkSetupFrame } from '@furria/ui/KkSetupFrame';
import { KkSetupTask } from '@furria/ui/KkSetupTask';
import type { FC, PropsWithChildren } from 'react';

interface SetupTaskPanelProps extends PropsWithChildren {
  task: SetupTask;
  title: string;
  wide: boolean;
}

export const SetupTaskPanel: FC<SetupTaskPanelProps> = ({ task, title, wide, children }) => {
  const drawer = useDrawer();
  const folded = !wide && task.more.length > 0;
  const shown = folded ? task.tools : [...task.tools, ...task.more];
  const tools = shown.map((tool) => <SetupToolButton key={tool.key} tool={tool} />);
  const more = folded ? (
    <KkIconButton label={SETUP_MORE} icon="menuVertical" onClick={drawer.open} />
  ) : null;
  const sheet =
    folded && drawer.shown ? (
      <SetupMoreDrawer title={title} tools={task.more} onClose={drawer.close} />
    ) : null;
  const toolRow =
    shown.length === 0 && more === null ? null : (
      <KkSetupTask.Tools label={title}>
        {tools}
        {more}
      </KkSetupTask.Tools>
    );

  return (
    <KkSetupFrame.Task>
      <KkSetupTask label={SETUP_TASK}>
        <KkSetupTask.Sentence text={task.sentence} />
        <KkSetupTask.Body>{children}</KkSetupTask.Body>
        {toolRow}
      </KkSetupTask>
      {sheet}
    </KkSetupFrame.Task>
  );
};
