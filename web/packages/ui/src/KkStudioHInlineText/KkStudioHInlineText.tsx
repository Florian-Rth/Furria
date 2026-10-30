import InputBase from '@mui/material/InputBase';
import type { Theme } from '@mui/material/styles';
import type { ChangeEvent, FC } from 'react';
import { kkTokens } from '../tokens';

export type KkStudioHInlineTextVariant = 'name' | 'note';

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

interface KkStudioHInlineTextProps {
  value: string;
  label: string;
  placeholder: string;
  variant: KkStudioHInlineTextVariant;
  onChange: (value: string) => void;
}

export const KkStudioHInlineText: FC<KkStudioHInlineTextProps> = ({
  value,
  label,
  placeholder,
  variant,
  onChange,
}) => {
  const change = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange(event.target.value);
  };

  return (
    <InputBase
      value={value}
      placeholder={placeholder}
      onChange={change}
      inputProps={{ 'aria-label': label, 'data-kk-studio-h-inline': variant }}
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
