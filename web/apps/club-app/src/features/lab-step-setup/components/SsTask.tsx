import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkSsFrame } from '@furria/ui/KkSsFrame';
import { KkSsTask } from '@furria/ui/KkSsTask';
import type { FC, PropsWithChildren } from 'react';
import { useDrawer } from '../hooks/use-drawer';
import { SS_MORE, SS_TASK } from '../setup-copy';
import type { SetupTask } from '../setup-task';
import { SsMoreDrawer } from './SsMoreDrawer';
import { SsToolButton } from './SsToolButton';

interface SsTaskProps extends PropsWithChildren {
  task: SetupTask;
  title: string;
  wide: boolean;
}

export const SsTask: FC<SsTaskProps> = ({ task, title, wide, children }) => {
  const drawer = useDrawer();
  const folded = !wide && task.more.length > 0;
  const shown = folded ? task.tools : [...task.tools, ...task.more];
  const tools = shown.map((tool) => <SsToolButton key={tool.key} tool={tool} />);
  const more = folded ? (
    <KkIconButton label={SS_MORE} icon="menuVertical" onClick={drawer.open} />
  ) : null;
  const sheet =
    folded && drawer.shown ? (
      <SsMoreDrawer title={title} tools={task.more} onClose={drawer.close} />
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
