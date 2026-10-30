import { KkFocusBar } from '@furria/ui/KkFocusBar';
import type { FC } from 'react';
import type { FocusChip } from '../hooks/use-focus-chips';

interface FocusChipListProps {
  chips: readonly FocusChip[];
}

export const FocusChipList: FC<FocusChipListProps> = ({ chips }) => {
  const list = chips.map((chip) => (
    <KkFocusBar.Chip
      key={chip.key}
      glyph={chip.glyph}
      text={chip.text}
      pressed={chip.pressed}
      disabled={chip.disabled}
      onPress={chip.press}
    />
  ));

  return <>{list}</>;
};
