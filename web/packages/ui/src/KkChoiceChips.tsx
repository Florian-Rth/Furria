import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { FC, MouseEvent } from 'react';
import { choiceChipPaint } from './internal/choice-chip-paint';
import type { KkIconName } from './KkIcon';
import { KkIcon } from './KkIcon';
import type { KkSx } from './kk-sx';

export interface KkChoiceChip {
  id: string;
  label: string;
  icon?: KkIconName;
  disabled?: boolean;
}

interface KkChoiceChipsProps {
  label: string;
  choices: readonly KkChoiceChip[];
  value: string | null;
  onChange: (id: string) => void;
  sx?: KkSx;
}

export const KkChoiceChips: FC<KkChoiceChipsProps> = ({ label, choices, value, onChange, sx }) => {
  const choose = (event: MouseEvent<HTMLButtonElement>): void => {
    const id = event.currentTarget.dataset.kkChoiceChip;

    if (id !== undefined) {
      onChange(id);
    }
  };
  const buttons = choices.map((choice) => {
    const icon = choice.icon === undefined ? null : <KkIcon name={choice.icon} size="small" />;

    return (
      <ButtonBase
        key={choice.id}
        role="radio"
        aria-checked={choice.id === value}
        disabled={choice.disabled}
        data-kk-choice-chip={choice.id}
        onClick={choose}
        sx={choiceChipPaint}
      >
        {icon}
        {choice.label}
      </ButtonBase>
    );
  });

  return (
    <Stack
      direction="row"
      role="radiogroup"
      aria-label={label}
      sx={[{ flexWrap: 'wrap', gap: 0.75, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {buttons}
    </Stack>
  );
};
