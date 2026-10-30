import InputBase from '@mui/material/InputBase';
import type { Theme } from '@mui/material/styles';
import type { ChangeEvent, FC, KeyboardEvent } from 'react';
import { kkTokens } from '../tokens';

export type KkStudioInlineTextVariant = 'name' | 'note';

const SHORT = '@container kk-practice (max-height: 40rem)';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const NAME_SX = {
  height: { xs: '2.25rem', desktop: '2.75rem' },
  '& input': {
    typography: { xs: 'h2', desktop: 'h1' },
    lineHeight: { xs: '2.25rem', desktop: '2.75rem' },
  },
} as const;

const NOTE_SX = {
  height: '1.25rem',
  [SHORT]: { display: 'none' },
  '& input': { typography: 'body2', lineHeight: '1.25rem', color: 'text.secondary' },
} as const;

interface KkStudioInlineTextProps {
  value: string;
  label: string;
  placeholder: string;
  variant: KkStudioInlineTextVariant;
  maxLength: number;
  onChange: (value: string) => void;
  onCommit: () => void;
}

export const KkStudioInlineText: FC<KkStudioInlineTextProps> = ({
  value,
  label,
  placeholder,
  variant,
  maxLength,
  onChange,
  onCommit,
}) => {
  const change = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange(event.target.value);
  };
  const settle = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
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
      onKeyDown={settle}
      inputProps={{ 'aria-label': label, 'data-kk-studio-inline': variant, maxLength }}
      sx={[
        (theme) => ({
          display: 'block',
          minWidth: 0,
          p: 0,
          backgroundImage: `linear-gradient(to right, ${palette(theme).divider} 50%, transparent 50%)`,
          backgroundSize: '6px 1.5px',
          backgroundRepeat: 'repeat-x',
          backgroundPosition: 'left bottom',
          transition: 'background-image 160ms ease-out',
          '&.Mui-focused': {
            backgroundImage: `linear-gradient(to right, ${palette(theme).primary.main} 100%, transparent 0)`,
            backgroundSize: `100% ${kkTokens.line.section}px`,
          },
          '& input': {
            p: 0,
            height: '100%',
            textOverflow: 'ellipsis',
            userSelect: 'text',
            WebkitUserSelect: 'text',
          },
        }),
        variant === 'name' ? NAME_SX : NOTE_SX,
      ]}
    />
  );
};
