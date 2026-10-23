import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, MouseEvent } from 'react';
import { focusRing } from './internal/focus-ring';
import { inkWashSurface } from './internal/ink-wash';
import type { KkIconName } from './KkIcon';
import { KkIcon } from './KkIcon';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export interface KkChoiceChip {
  id: string;
  label: string;
  icon?: KkIconName;
  disabled?: boolean;
}

const choicePaint = (theme: Theme): CSSObject => ({
  gap: 0.5,
  px: 1.25,
  py: 0.75,
  borderRadius: `${kkTokens.radius.pill}px`,
  borderWidth: kkTokens.line.hair,
  borderStyle: 'solid',
  borderColor: 'divider',
  typography: 'caption',
  fontWeight: 800,
  lineHeight: 1.2,
  color: 'text.primary',
  ...focusRing(theme),
  '&[aria-checked="true"]': {
    color: 'background.paper',
    backgroundColor: 'text.primary',
    borderColor: 'text.primary',
  },
  '&.Mui-disabled': { color: 'text.disabled', borderStyle: 'dashed' },
  '@media (hover: hover)': {
    '&:hover:not([aria-checked="true"])': inkWashSurface(theme, '6%', '10%'),
  },
});

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
        sx={choicePaint}
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
