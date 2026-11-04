import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, MouseEvent } from 'react';
import { focusRing } from '../internal/focus-ring';
import { inkWash } from '../internal/ink-wash';
import { redInk } from '../internal/red-ink';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';

export interface KkPourCount {
  value: number;
  label: string;
  disabled: boolean;
}

const CELL = '2.75rem';

const cellPaint = (theme: Theme): CSSObject => ({
  width: CELL,
  minHeight: CELL,
  borderRadius: `${kkTokens.radius.base}px`,
  borderWidth: kkTokens.line.section,
  borderStyle: 'solid',
  borderColor: 'divider',
  color: 'text.secondary',
  ...focusRing(theme),
  '&[aria-checked="true"]': {
    ...redInk(theme),
    borderColor: 'currentColor',
    backgroundColor: `color-mix(in srgb, ${(theme.vars ?? theme).palette.primary.main} 10%, transparent)`,
  },
  '&.Mui-disabled': { opacity: 0.4, borderStyle: 'dashed' },
  '@media (hover: hover)': {
    '&:hover:not([aria-checked="true"])': { backgroundColor: inkWash(theme, '6%') },
  },
});

interface KkPourCountPickerProps {
  label: string;
  counts: readonly KkPourCount[];
  value: number;
  onChange: (value: number) => void;
  sx?: KkSx;
}

export const KkPourCountPicker: FC<KkPourCountPickerProps> = ({
  label,
  counts,
  value,
  onChange,
  sx,
}) => {
  const choose = (event: MouseEvent<HTMLButtonElement>): void => {
    onChange(Number(event.currentTarget.dataset.value));
  };
  const cells = counts.map((count) => (
    <ButtonBase
      key={count.value}
      role="radio"
      aria-checked={count.value === value}
      aria-label={count.label}
      data-value={count.value}
      data-kk-pour-count={count.value}
      disabled={count.disabled}
      onClick={choose}
      sx={cellPaint}
    >
      <Typography variant="h3" component="span" sx={{ lineHeight: 1 }}>
        {count.value}
      </Typography>
    </ButtonBase>
  ));

  return (
    <Stack
      direction="row"
      role="radiogroup"
      aria-label={label}
      sx={[{ gap: 0.5, flexShrink: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {cells}
    </Stack>
  );
};
