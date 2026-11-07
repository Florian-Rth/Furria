import { SetupMoreDrawer } from '@furria/studio/SetupMoreDrawer';
import { SetupToolButton } from '@furria/studio/SetupToolButton';
import type { SetupTask } from '@furria/studio/setup-task';
import { SS_MORE, SS_TASK } from '@furria/studio/step-setup-copy';
import { useDrawer } from '@furria/studio/use-drawer';
import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkSsFrame } from '@furria/ui/KkSsFrame';
import { KkSsTask } from '@furria/ui/KkSsTask';
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
    <KkIconButton label={SS_MORE} icon="menuVertical" onClick={drawer.open} />
  ) : null;
  const sheet =
    folded && drawer.shown ? (
      <SetupMoreDrawer title={title} tools={task.more} onClose={drawer.close} />
    ) : null;
  const toolRow =
    shown.length === 0 && more === null ? null : (
      <KkSsTask.Tools label={title}>
        {tools}
        {more}
      </KkSsTask.Tools>
    );

  return (
    <KkSsFrame.Task>
      <KkSsTask label={SS_TASK}>
        <KkSsTask.Sentence text={task.sentence} />
        <KkSsTask.Body>{children}</KkSsTask.Body>
        {toolRow}
      </KkSsTask>
      {sheet}
    </KkSsFrame.Task>
  );
};
