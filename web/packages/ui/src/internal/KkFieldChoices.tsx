import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { KkFieldChoice } from './field-choice';
import { KkFieldChoiceChip } from './KkFieldChoiceChip';

interface KkFieldChoicesProps {
  label: string;
  choices: readonly KkFieldChoice[];
  selectedId?: string;
  disabled?: boolean;
  onSelect: (id: string) => void;
}

export const KkFieldChoices: FC<KkFieldChoicesProps> = ({
  label,
  choices,
  selectedId,
  disabled = false,
  onSelect,
}) => {
  const chips = choices.map((choice) => {
    const selected = choice.id === selectedId;

    return (
      <KkFieldChoiceChip
        key={choice.id}
        choice={choice}
        selected={selected}
        disabled={disabled}
        onSelect={onSelect}
      />
    );
  });

  return (
    <Stack
      direction="row"
      role="group"
      aria-label={label}
      data-kk-field-choices
      sx={{ flexWrap: 'wrap', alignItems: 'center', gap: 0.75, minWidth: 0 }}
    >
      {chips}
    </Stack>
  );
};
