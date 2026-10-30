import InputBase from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ChangeEvent, FC, KeyboardEvent } from 'react';
import { useId } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkLaneInspectorFieldProps {
  label: string;
  value: string;
  placeholder: string;
  maxLength: number;
  onChange: (value: string) => void;
  onCommit: () => void;
}

export const KkLaneInspectorField: FC<KkLaneInspectorFieldProps> = ({
  label,
  value,
  placeholder,
  maxLength,
  onChange,
  onCommit,
}) => {
  const id = useId();
  const change = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange(event.target.value);
  };
  const press = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    }
  };

  return (
    <Stack sx={{ gap: 0.25 }}>
      <Typography
        component="label"
        htmlFor={id}
        variant="caption"
        sx={{ color: 'text.secondary', fontWeight: 700 }}
      >
        {label}
      </Typography>
      <InputBase
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={change}
        onBlur={onCommit}
        onKeyDown={press}
        inputProps={{ maxLength }}
        sx={(theme) => ({
          minHeight: kkTokens.tapTarget,
          px: 1,
          typography: 'body2',
          fontWeight: 700,
          borderRadius: `${kkTokens.radius.bar}px`,
          boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
          '&.Mui-focused': {
            boxShadow: `inset 0 0 0 ${kkTokens.line.section}px ${palette(theme).text.primary}`,
          },
        })}
      />
    </Stack>
  );
};
