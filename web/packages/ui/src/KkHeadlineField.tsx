import InputBase from '@mui/material/InputBase';
import type { ChangeEvent, FC, KeyboardEvent } from 'react';

export type KkHeadlineFieldSize = 'hero' | 'pane';

const TYPOGRAPHY: Record<KkHeadlineFieldSize, string> = { hero: 'display', pane: 'h3' };
const LINE_HEIGHT: Record<KkHeadlineFieldSize, number> = { hero: 0.96, pane: 1.1 };

interface KkHeadlineFieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  readOnly?: boolean;
  size?: KkHeadlineFieldSize;
  onChange: (value: string) => void;
}

export const KkHeadlineField: FC<KkHeadlineFieldProps> = ({
  id,
  label,
  placeholder,
  value,
  readOnly = false,
  size = 'hero',
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
        typography: TYPOGRAPHY[size],
        lineHeight: LINE_HEIGHT[size],
        color: 'text.primary',
        '& textarea': {
          p: 0,
          lineHeight: LINE_HEIGHT[size],
          hyphens: 'auto',
          overflowWrap: 'normal',
        },
        '& textarea::placeholder': { color: 'text.disabled', opacity: 1 },
      }}
    />
  );
};
