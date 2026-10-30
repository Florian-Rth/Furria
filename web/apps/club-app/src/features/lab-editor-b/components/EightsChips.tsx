import { KkEightsChip } from '@furria/ui/KkEightsChip';
import { KkEightsStrip } from '@furria/ui/KkEightsStrip';
import type { FC } from 'react';
import type { EightsChip } from '../hooks/use-eights-stage-tools';

interface EightsChipsProps {
  label: string;
  chips: readonly EightsChip[];
  wrap: boolean;
}

export const EightsChips: FC<EightsChipsProps> = ({ label, chips, wrap }) => {
  const shown = chips.map((chip) => (
    <KkEightsChip
      key={chip.key}
      glyph={chip.glyph}
      text={chip.text}
      pressed={chip.pressed}
      disabled={chip.disabled}
      onPress={chip.press}
    />
  ));

  return (
    <KkEightsStrip.Tools label={label} wrap={wrap}>
      {shown}
    </KkEightsStrip.Tools>
  );
};
