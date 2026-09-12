import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import ToggleButton from '@mui/material/ToggleButton';
import type { FC, MouseEvent } from 'react';
import { useEffect, useRef } from 'react';
import { accentWash } from './internal/accent-wash';
import { focusRing } from './internal/focus-ring';
import type { KkSx } from './kk-sx';
import type { KkLetterIndexEntry } from './letter-index-cells';
import { toLetterIndexCells } from './letter-index-cells';
import { kkTokens } from './tokens';

const CELL_SIZE = 25;
const CELL_FONT_SIZE = '0.8125rem';
const SELECTED_CELL = '[data-kk-letter-index-cell][aria-pressed="true"]';

const cellStyles = (theme: Theme): CSSObject => ({
  width: CELL_SIZE,
  height: CELL_SIZE,
  minWidth: CELL_SIZE,
  minHeight: CELL_SIZE,
  padding: 0,
  borderWidth: 0,
  borderRadius: '50%',
  fontFamily: kkTokens.font.display,
  fontSize: CELL_FONT_SIZE,
  fontWeight: kkTokens.font.displayWeight,
  letterSpacing: '0.02em',
  lineHeight: 1,
  color: (theme.vars ?? theme).palette.text.primary,
  backgroundColor: 'transparent',
  ...focusRing(theme),
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

type KkLetterIndexVariant = 'grid' | 'strip';

const variantLayout: Record<KkLetterIndexVariant, KkSx> = {
  grid: { flexWrap: 'wrap' },
  strip: {
    flexWrap: { xs: 'wrap', sm: 'nowrap' },
    gap: { xs: 0.25, sm: 0.5 },
    overflowX: { xs: 'visible', sm: 'auto' },
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
  },
};

interface KkLetterIndexProps {
  label: string;
  letters: readonly KkLetterIndexEntry[];
  current?: string;
  onSelect: (letter: string) => void;
  variant?: KkLetterIndexVariant;
  sx?: KkSx;
}

export const KkLetterIndex: FC<KkLetterIndexProps> = ({
  label,
  letters,
  current,
  onSelect,
  variant = 'grid',
  sx,
}) => {
  const cells = toLetterIndexCells(letters, current);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selected = stripRef.current?.querySelector(SELECTED_CELL) ?? null;

    selected?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [current]);

  const selectLetter = (_event: MouseEvent<HTMLElement>, letter: string): void => {
    onSelect(letter);
  };

  return (
    <Stack
      ref={stripRef}
      direction="row"
      role="group"
      aria-label={label}
      data-kk-letter-index
      sx={[{ gap: 0.5, minWidth: 0 }, variantLayout[variant], ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {cells.map((cell) => (
        <ToggleButton
          key={cell.letter}
          value={cell.letter}
          selected={cell.selected}
          disabled={cell.disabled}
          onChange={selectLetter}
          data-kk-letter-index-cell
          sx={cellStyles}
        >
          {cell.letter}
        </ToggleButton>
      ))}
    </Stack>
  );
};
