import { KkStartTile } from '@furria/ui/KkStartTile';
import type { FC } from 'react';
import { useToDosTile } from '../hooks/use-to-dos-tile';
import type { StartPanelOf } from '../start-board';
import { START_HELP_SPOTS } from '../start-help-copy';

const TILE_LABEL = 'Zu erledigen';
const HEAD_LABEL = 'ZU ERLEDIGEN';

interface ToDosTileProps {
  panel: StartPanelOf<'toDos'>;
  order: number;
}

export const ToDosTile: FC<ToDosTileProps> = ({ panel, order }) => {
  const counters = useToDosTile(panel).map((counter) => (
    <KkStartTile.Counter
      key={counter.key}
      icon={counter.icon}
      value={counter.value}
      label={counter.label}
      reach={counter.reach}
    />
  ));

  return (
    <KkStartTile label={TILE_LABEL} order={order} landing={START_HELP_SPOTS.toDos}>
      <KkStartTile.Head icon="select" label={HEAD_LABEL} />
      <KkStartTile.Counters>{counters}</KkStartTile.Counters>
    </KkStartTile>
  );
};
