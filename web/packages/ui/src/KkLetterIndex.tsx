import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import ToggleButton from '@mui/material/ToggleButton';
import type { FC, MouseEvent } from 'react';
import { accentWash } from './internal/accent-wash';
import type { KkSx } from './kk-sx';
import type { KkLetterIndexEntry } from './letter-index-cells';
import { toLetterIndexCells } from './letter-index-cells';
import { kkTokens } from './tokens';

const CELL_SIZE = 25;
const CELL_SIZE_FONT = '0.8125rem';

const cellStyles = (theme: Theme): CSSObject => ({
  width: CELL_SIZE,
  height: CELL_SIZE,
  minWidth: CELL_SIZE,
  minHeight: CELL_SIZE,
  padding: 0,
  borderWidth: 0,
  borderRadius: '50%',
  fontFamily: kkTokens.font.display,
  fontSize: CELL_SIZE_FONT,
  fontWeight: 400,
  letterSpacing: '0.02em',
  lineHeight: 1,
  color: (theme.vars ?? theme).palette.text.primary,
  backgroundColor: 'transparent',
  '&.Mui-disabled': {
    borderWidth: 0,
    color: (theme.vars ?? theme).palette.text.disabled,
  },
  '&.Mui-selected': {
    color: (theme.vars ?? theme).palette.primary.main,
    ...accentWash(theme),
    '&:hover': accentWash(theme),
  },
});

interface KkLetterIndexProps {
  letters: readonly KkLetterIndexEntry[];
  current?: string;
  onSelect: (letter: string) => void;
  sx?: KkSx;
}

export const KkLetterIndex: FC<KkLetterIndexProps> = ({ letters, current, onSelect, sx }) => {
  const cells = toLetterIndexCells(letters, current);

  const selectLetter = (_event: MouseEvent<HTMLElement>, letter: string): void => {
    onSelect(letter);
  };

  return (
    <Stack
      direction="row"
      role="group"
      data-kk-letter-index
      sx={[{ flexWrap: 'wrap', gap: 0.5, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {cells.map((cell) => (
        <ToggleButton
          key={cell.letter}
          value={cell.letter}
          selected={cell.selected}
          disabled={cell.disabled}
          onChange={selectLetter}
          sx={cellStyles}
        >
          {cell.letter}
        </ToggleButton>
      ))}
    </Stack>
  );
};
