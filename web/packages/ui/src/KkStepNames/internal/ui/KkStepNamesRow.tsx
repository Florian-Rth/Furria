import InputBase from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ChangeEvent, FC, KeyboardEvent } from 'react';
import { useId } from 'react';
import { focusNextName, NAME_GAP, NAME_LIMIT, NUMBER_WIDTH, nameFieldPaint } from '../name-field';

interface KkStepNamesRowProps {
  number: number;
  label: string;
  value: string;
  placeholder: string;
  current: boolean;
  last: boolean;
  onChange: (value: string) => void;
  onCommit: () => void;
  onFocus: () => void;
}

export const KkStepNamesRow: FC<KkStepNamesRowProps> = ({
  number,
  label,
  value,
  placeholder,
  current,
  last,
  onChange,
  onCommit,
  onFocus,
}) => {
  const id = useId();
  const change = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange(event.target.value);
  };
  const press = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      event.preventDefault();
      focusNextName(event.currentTarget);
    }
  };
  const hint = last ? 'done' : 'next';

  return (
    <Stack
      component="li"
      direction="row"
      aria-current={current ? 'step' : undefined}
      sx={{
        alignItems: 'center',
        gap: NAME_GAP,
        minWidth: 0,
        '&[aria-current] > label': { color: 'text.primary' },
      }}
    >
      <Typography
        component="label"
        htmlFor={id}
        variant="body2"
        sx={{
          flexShrink: 0,
          width: (theme) => theme.spacing(NUMBER_WIDTH),
          fontWeight: 800,
          textAlign: 'end',
          fontVariantNumeric: 'tabular-nums',
          color: 'text.secondary',
        }}
      >
        {number}
      </Typography>
      <InputBase
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={change}
        onBlur={onCommit}
        onFocus={onFocus}
        onKeyDown={press}
        inputProps={{
          maxLength: NAME_LIMIT,
          enterKeyHint: hint,
          'data-kk-step-name': true,
          'aria-label': label,
        }}
        sx={nameFieldPaint}
      />
    </Stack>
  );
};
