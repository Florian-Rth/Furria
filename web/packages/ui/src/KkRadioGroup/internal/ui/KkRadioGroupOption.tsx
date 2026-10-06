import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { useId } from 'react';
import { kkTokens } from '../../../tokens';

interface KkRadioGroupOptionProps {
  value: string;
  label: string;
  description?: string;
  trailing?: ReactNode;
  disabled?: boolean;
}

export const KkRadioGroupOption: FC<KkRadioGroupOptionProps> = ({
  value,
  label,
  description,
  trailing,
  disabled = false,
}) => {
  const optionId = useId();
  const controlId = `${optionId}-control`;
  const descriptionId = `${optionId}-description`;
  const describedBy = description === undefined ? undefined : descriptionId;
  const labelColor = disabled ? 'text.disabled' : 'text.primary';
  const labelCursor = disabled ? 'default' : 'pointer';

  const descriptionLine =
    description === undefined ? null : (
      <Typography
        id={descriptionId}
        variant="body2"
        sx={{ color: 'text.secondary', textWrap: 'pretty' }}
      >
        {description}
      </Typography>
    );

  const trailingSlot =
    trailing === undefined ? null : <Stack sx={{ flexShrink: 0, pt: 1 }}>{trailing}</Stack>;

  return (
    <Stack
      direction="row"
      data-kk-radio-option
      sx={{ alignItems: 'flex-start', gap: 0.5, minWidth: 0 }}
    >
      <Radio
        id={controlId}
        value={value}
        disabled={disabled}
        slotProps={{ input: { 'aria-describedby': describedBy } }}
        sx={{ flexShrink: 0 }}
      />
      <Stack
        sx={{ minWidth: 0, flexGrow: 1, maxWidth: kkTokens.measure.text, gap: 0.5, pt: 1.125 }}
      >
        <Typography
          component="label"
          htmlFor={controlId}
          sx={{ color: labelColor, typography: 'body2', fontWeight: 800, cursor: labelCursor }}
        >
          {label}
        </Typography>
        {descriptionLine}
      </Stack>
      {trailingSlot}
    </Stack>
  );
};
