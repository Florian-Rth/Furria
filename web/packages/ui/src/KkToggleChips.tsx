import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { FC, MouseEvent } from 'react';
import { choiceChipPaint } from './internal/choice-chip-paint';
import type { KkSx } from './kk-sx';

export interface KkToggleChip {
  id: string;
  label: string;
}

interface KkToggleChipsProps {
  label: string;
  chips: readonly KkToggleChip[];
  selected: readonly string[];
  onToggle: (id: string) => void;
  disabled?: boolean;
  sx?: KkSx;
}

export const KkToggleChips: FC<KkToggleChipsProps> = ({
  label,
  chips,
  selected,
  onToggle,
  disabled = false,
  sx,
}) => {
  const toggle = (event: MouseEvent<HTMLButtonElement>): void => {
    const id = event.currentTarget.dataset.kkToggleChip;

    if (id !== undefined) {
      onToggle(id);
    }
  };
  const buttons = chips.map((chip) => (
    <ButtonBase
      key={chip.id}
      aria-pressed={selected.includes(chip.id)}
      disabled={disabled}
      data-kk-toggle-chip={chip.id}
      onClick={toggle}
      sx={choiceChipPaint}
    >
      {chip.label}
    </ButtonBase>
  ));

  return (
    <Stack
      direction="row"
      role="group"
      aria-label={label}
      sx={[{ flexWrap: 'wrap', gap: 0.75, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {buttons}
    </Stack>
  );
};
