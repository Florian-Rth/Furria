import InputBase from '@mui/material/InputBase';
import type { ChangeEvent, FC } from 'react';

interface KkCaptionFieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  readOnly?: boolean;
  onChange: (value: string) => void;
}

export const KkCaptionField: FC<KkCaptionFieldProps> = ({
  id,
  label,
  placeholder,
  value,
  readOnly = false,
  onChange,
}) => {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
    onChange(event.target.value);
  };

  return (
    <InputBase
      id={id}
      fullWidth
      value={value}
      placeholder={placeholder}
      readOnly={readOnly}
      onChange={handleChange}
      slotProps={{ input: { 'aria-label': label } }}
      data-kk-caption-field
      sx={{
        typography: 'caption',
        fontWeight: 600,
        color: 'text.secondary',
        borderBottom: 1,
        borderBottomStyle: 'dashed',
        borderColor: 'transparent',
        '&:not(.MuiInputBase-readOnly):hover, &.Mui-focused:not(.MuiInputBase-readOnly)': {
          borderColor: 'divider',
        },
        '& input': { p: 0, py: 0.25 },
        '& input::placeholder': {
          color: 'text.disabled',
          opacity: 1,
          fontStyle: 'italic',
          fontWeight: 400,
        },
      }}
    />
  );
};
