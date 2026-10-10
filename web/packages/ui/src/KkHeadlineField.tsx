import InputBase from '@mui/material/InputBase';
import type { ChangeEvent, FC, KeyboardEvent } from 'react';

interface KkHeadlineFieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  readOnly?: boolean;
  onChange: (value: string) => void;
}

export const KkHeadlineField: FC<KkHeadlineFieldProps> = ({
  id,
  label,
  placeholder,
  value,
  readOnly = false,
  onChange,
}) => {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
    onChange(event.target.value.replace(/\s*\n\s*/g, ' '));
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  };

  return (
    <InputBase
      id={id}
      multiline
      fullWidth
      value={value}
      placeholder={placeholder}
      readOnly={readOnly}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      slotProps={{ input: { 'aria-label': label } }}
      data-kk-headline-field
      sx={{
        p: 0,
        typography: 'display',
        lineHeight: 0.96,
        color: 'text.primary',
        '& textarea': { p: 0, lineHeight: 0.96, hyphens: 'auto', overflowWrap: 'normal' },
        '& textarea::placeholder': { color: 'text.disabled', opacity: 1 },
      }}
    />
  );
};
