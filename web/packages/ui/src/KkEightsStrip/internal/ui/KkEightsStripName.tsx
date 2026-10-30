import InputBase from '@mui/material/InputBase';
import type { Theme } from '@mui/material/styles';
import type { ChangeEvent, FC, KeyboardEvent } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkEightsStripNameProps {
  value: string;
  label: string;
  placeholder: string;
  maxLength: number;
  onChange: (value: string) => void;
  onCommit: () => void;
}

export const KkEightsStripName: FC<KkEightsStripNameProps> = ({
  value,
  label,
  placeholder,
  maxLength,
  onChange,
  onCommit,
}) => {
  const change = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange(event.target.value);
  };
  const key = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    }
  };

  return (
    <InputBase
      value={value}
      placeholder={placeholder}
      onChange={change}
      onBlur={onCommit}
      onKeyDown={key}
      inputProps={{ 'aria-label': label, maxLength }}
      sx={(theme) => ({
        minHeight: kkTokens.tapTarget,
        px: 1,
        borderRadius: `${kkTokens.radius.base - 4}px`,
        typography: 'body2',
        fontWeight: 700,
        backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 6%, transparent)`,
        '&.Mui-focused': {
          boxShadow: `inset 0 0 0 ${kkTokens.line.section}px ${palette(theme).primary.main}`,
        },
      })}
    />
  );
};
