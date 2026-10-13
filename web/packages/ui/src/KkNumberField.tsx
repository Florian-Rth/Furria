import Stack from '@mui/material/Stack';
import type { ChangeEvent, FC } from 'react';
import { canStep, stepNumber } from './internal/number-step';
import { KkIconButton } from './KkIconButton';
import type { KkSx } from './kk-sx';
import { KkTextField } from './KkTextField';

export interface KkNumberStepLabels {
  less: string;
  more: string;
}

interface KkNumberFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  stepLabels: KkNumberStepLabels;
  min?: number;
  max?: number;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  hint?: string;
  error?: boolean;
  helperText?: string;
  sx?: KkSx;
}

export const KkNumberField: FC<KkNumberFieldProps> = ({
  name,
  label,
  value,
  onChange,
  stepLabels,
  min,
  max,
  required,
  disabled = false,
  placeholder,
  hint,
  error,
  helperText,
  sx,
}) => {
  const bounds = { min, max };
  const cannotLess = disabled || !canStep(value, -1, bounds);
  const cannotMore = disabled || !canStep(value, 1, bounds);

  const change = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    onChange(event.target.value);
  };
  const less = (): void => {
    onChange(stepNumber(value, -1, bounds));
  };
  const more = (): void => {
    onChange(stepNumber(value, 1, bounds));
  };

  const steppers = (
    <Stack direction="row" sx={{ alignItems: 'center' }}>
      <KkIconButton
        label={stepLabels.less}
        icon="subtract"
        size="small"
        disabled={cannotLess}
        onClick={less}
      />
      <KkIconButton
        label={stepLabels.more}
        icon="add"
        size="small"
        disabled={cannotMore}
        onClick={more}
      />
    </Stack>
  );

  return (
    <KkTextField
      name={name}
      label={label}
      inputMode="numeric"
      autoComplete="off"
      required={required}
      disabled={disabled}
      placeholder={placeholder}
      hint={hint}
      error={error}
      helperText={helperText}
      value={value}
      onChange={change}
      endAdornment={steppers}
      sx={sx}
    />
  );
};
