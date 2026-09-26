import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ChangeEvent, FC } from 'react';
import { useId } from 'react';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

interface KkCheckboxRowProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  disabled?: boolean;
  sx?: KkSx;
}

export const KkCheckboxRow: FC<KkCheckboxRowProps> = ({
  label,
  checked,
  onChange,
  description,
  disabled = false,
  sx,
}) => {
  const rowId = useId();
  const controlId = `${rowId}-control`;
  const descriptionId = `${rowId}-description`;
  const describedBy = description === undefined ? undefined : descriptionId;

  const change = (_event: ChangeEvent<HTMLInputElement>, nextChecked: boolean): void => {
    onChange(nextChecked);
  };

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

  return (
    <Stack
      direction="row"
      data-kk-checkbox-row
      sx={[{ alignItems: 'flex-start', gap: 0.5, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Checkbox
        id={controlId}
        checked={checked}
        onChange={change}
        disabled={disabled}
        slotProps={{ input: { 'aria-describedby': describedBy } }}
        sx={{ flexShrink: 0 }}
      />
      <Stack sx={{ minWidth: 0, maxWidth: kkTokens.measure.text, gap: 0.5, pt: 1.125 }}>
        <Typography
          component="label"
          htmlFor={controlId}
          sx={{ color: 'text.primary', typography: 'body2', fontWeight: 800, cursor: 'pointer' }}
        >
          {label}
        </Typography>
        {descriptionLine}
      </Stack>
    </Stack>
  );
};
