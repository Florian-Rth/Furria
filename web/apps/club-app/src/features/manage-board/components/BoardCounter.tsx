import { KkTallyStrip } from '@furria/ui/KkTallyStrip';
import type { FC } from 'react';
import type { CounterView } from '../board-hub-copy';
import { toCounterAria } from '../board-hub-copy';
import type { BoardFilter } from '../schemas';

interface BoardCounterProps {
  view: CounterView;
  count: number;
  selected: boolean;
  onChoose: (filter: BoardFilter) => void;
}

export const BoardCounter: FC<BoardCounterProps> = ({ view, count, selected, onChoose }) => {
  const choose = (): void => {
    onChoose(view.id);
  };
  const tone = view.attention ? 'attention' : 'ink';
  const ariaLabel = toCounterAria(view.label, count);

  return (
    <KkTallyStrip.Counter
      icon={view.icon}
      label={view.label}
      count={count}
      ariaLabel={ariaLabel}
      tone={tone}
      selected={selected}
      onSelect={choose}
    />
  );
};
