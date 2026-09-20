import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { useId } from 'react';
import { KkFieldChoiceChip } from './internal/KkFieldChoiceChip';
import { KkEyebrow } from './KkEyebrow';
import type { KkSelectOption } from './KkSelectField';
import type { KkSx } from './kk-sx';

interface KkMultiSelectFieldProps {
  name: string;
  label: string;
  values: readonly string[];
  options: readonly KkSelectOption[];
  onToggle: (value: string) => void;
  emptyLabel?: string;
  hint?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  sx?: KkSx;
}

export const KkMultiSelectField: FC<KkMultiSelectFieldProps> = ({
  name,
  label,
  values,
  options,
  onToggle,
  emptyLabel,
  hint,
  disabled = false,
  error,
  helperText,
  sx,
}) => {
  const fieldId = useId();
  const labelId = `${fieldId}-label`;
  const helperId = `${fieldId}-helper`;
  const helper = helperText ?? hint;
  const helperColor = error === true ? 'error.main' : 'text.secondary';
  const callerSx = Array.isArray(sx) ? sx : [sx];

  const chips = options.map((option) => (
    <KkFieldChoiceChip
      key={option.value}
      choice={{ id: option.value, label: option.label }}
      selected={values.includes(option.value)}
      disabled={disabled}
      invalid={error === true}
      onSelect={onToggle}
    />
  ));

  const carried = values.map((value) => (
    <Box key={value} component="input" type="hidden" name={name} value={value} readOnly />
  ));

  const helperLine =
    helper === undefined ? null : (
      <Typography id={helperId} variant="caption" sx={{ color: helperColor, textWrap: 'pretty' }}>
        {helper}
      </Typography>
    );

  const emptyLine =
    options.length > 0 || emptyLabel === undefined ? null : (
      <Typography variant="caption" sx={{ color: 'text.secondary', textWrap: 'pretty' }}>
        {emptyLabel}
      </Typography>
    );

  return (
    <Stack data-kk-multi-select-field sx={[{ minWidth: 0, gap: 1 }, ...callerSx]}>
      <Box component="span" id={labelId}>
        <KkEyebrow tone="muted">{label}</KkEyebrow>
      </Box>
      <Stack
        direction="row"
        role="group"
        aria-labelledby={labelId}
        aria-describedby={helper === undefined ? undefined : helperId}
        data-kk-multi-select-choices
        sx={{ flexWrap: 'wrap', alignItems: 'center', gap: 0.75, minWidth: 0 }}
      >
        {chips}
      </Stack>
      {emptyLine}
      {carried}
      {helperLine}
    </Stack>
  );
};
