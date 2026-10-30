import InputBase from '@mui/material/InputBase';
import type { Theme } from '@mui/material/styles';
import type { ChangeEvent, FC, KeyboardEvent } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;
const MAX_LENGTH = 80;

export interface KkFocusOutlineRename {
  value: string;
  label: string;
  placeholder: string;
  onChange: (value: string) => void;
  onCommit: () => void;
}

interface KkFocusOutlineFieldProps {
  rename: KkFocusOutlineRename;
  strong: boolean;
}

export const KkFocusOutlineField: FC<KkFocusOutlineFieldProps> = ({ rename, strong }) => {
  const change = (event: ChangeEvent<HTMLInputElement>): void => {
    rename.onChange(event.target.value);
  };
  const settle = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    if (event.key === 'Enter' || event.key === 'Escape') {
      event.currentTarget.blur();
    }
  };

  return (
    <InputBase
      value={rename.value}
      placeholder={rename.placeholder}
      onChange={change}
      onBlur={rename.onCommit}
      onKeyDown={settle}
      inputProps={{ 'aria-label': rename.label, maxLength: MAX_LENGTH }}
      sx={(theme) => ({
        flex: 1,
        minWidth: 0,
        p: 0,
        color: 'inherit',
        typography: 'body2',
        fontWeight: strong ? 800 : 700,
        backgroundImage: `linear-gradient(to right, ${palette(theme).text.secondary} 50%, transparent 50%)`,
        backgroundSize: '0.375rem 1px',
        backgroundRepeat: 'repeat-x',
        backgroundPosition: 'left bottom',
        '&.Mui-focused': {
          backgroundImage: `linear-gradient(to right, ${palette(theme).primary.main} 100%, transparent 0)`,
          backgroundSize: `100% ${kkTokens.line.section}px`,
        },
        '& input': { p: 0, height: '1.5rem', textOverflow: 'ellipsis', userSelect: 'text' },
      })}
    />
  );
};
