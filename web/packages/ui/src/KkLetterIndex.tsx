import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, KeyboardEvent, MouseEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { accentWash } from './internal/accent-wash';
import { focusRing } from './internal/focus-ring';
import { redInk } from './internal/red-ink';
import { nextRovingId } from './internal/roving-focus';
import type { KkSx } from './kk-sx';
import type { KkLetterIndexEntry } from './letter-index-cells';
import { toLetterIndexCells } from './letter-index-cells';
import { kkTokens } from './tokens';

const CELL_WIDTH_TOUCH = 32;
const CELL_HEIGHT_TOUCH = 38;
const CELL_SIZE_COMPACT = 25;
const CELL_FONT_SIZE = '0.8125rem';
const CELL_ATTRIBUTE = 'data-kk-letter-index-cell';
const CURRENT_CELL = `[${CELL_ATTRIBUTE}][aria-current="location"]`;
const UNDERLINE_WIDTH = '58%';
const UNDERLINE_INSET = '14%';

const cellStyles = (theme: Theme): CSSObject => ({
  position: 'relative',
  width: CELL_WIDTH_TOUCH,
  height: CELL_HEIGHT_TOUCH,
  minWidth: CELL_WIDTH_TOUCH,
  minHeight: CELL_HEIGHT_TOUCH,
  flexShrink: 0,
  padding: 0,
  borderRadius: `${kkTokens.radius.pill}px`,
  [theme.breakpoints.up('sm')]: {
    width: CELL_SIZE_COMPACT,
    height: CELL_SIZE_COMPACT,
    minWidth: CELL_SIZE_COMPACT,
    minHeight: CELL_SIZE_COMPACT,
    borderRadius: '50%',
  },
  fontFamily: kkTokens.font.display,
  fontSize: CELL_FONT_SIZE,
  fontWeight: kkTokens.font.displayWeight,
  letterSpacing: '0.02em',
  lineHeight: 1,
  color: (theme.vars ?? theme).palette.text.primary,
  backgroundColor: 'transparent',
  ...focusRing(theme),
  '&.Mui-disabled': {
    color: (theme.vars ?? theme).palette.text.disabled,
  },
  '&[aria-current="location"]': {
    ...redInk(theme),
    ...accentWash(theme),
    '&::after': {
      content: '""',
      position: 'absolute',
      left: '50%',
      bottom: UNDERLINE_INSET,
      transform: 'translateX(-50%)',
      width: UNDERLINE_WIDTH,
      height: kkTokens.line.section,
      borderRadius: `${kkTokens.radius.bar}px`,
      backgroundColor: 'currentColor',
    },
  },
});

type KkLetterIndexVariant = 'grid' | 'strip';

const variantLayout: Record<KkLetterIndexVariant, KkSx> = {
  grid: { flexWrap: 'wrap' },
  strip: {
    flexWrap: { xs: 'wrap', sm: 'nowrap' },
    gap: { xs: 0.75, sm: 0.5 },
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
  const [focusedLetter, setFocusedLetter] = useState<string | null>(null);

  const reachable = cells.filter((cell) => !cell.disabled).map((cell) => cell.letter);
  const fallbackLetter = reachable.find((letter) => letter === current) ?? reachable[0];
  const tabbableLetter =
    focusedLetter !== null && reachable.includes(focusedLetter) ? focusedLetter : fallbackLetter;

  useEffect(() => {
    const marked = stripRef.current?.querySelector(CURRENT_CELL) ?? null;

    marked?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [current]);

  const selectCell = (event: MouseEvent<HTMLButtonElement>): void => {
    const letter = event.currentTarget.dataset.kkLetterIndexCell;

    if (letter === undefined) {
      return;
    }

    setFocusedLetter(letter);
    onSelect(letter);
  };

  const moveFocus = (event: KeyboardEvent<HTMLDivElement>): void => {
    const target = nextRovingId(reachable, tabbableLetter, event.key);

    if (target === null) {
      return;
    }

    event.preventDefault();
    setFocusedLetter(target);
    stripRef.current?.querySelector<HTMLButtonElement>(`[${CELL_ATTRIBUTE}="${target}"]`)?.focus();
  };

  return (
    <Stack
      ref={stripRef}
      direction="row"
      role="toolbar"
      aria-label={label}
      onKeyDown={moveFocus}
      data-kk-letter-index
      sx={[{ gap: 0.5, minWidth: 0 }, variantLayout[variant], ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {cells.map((cell) => (
        <ButtonBase
          key={cell.letter}
          disabled={cell.disabled}
          onClick={selectCell}
          aria-current={cell.current ? 'location' : undefined}
          tabIndex={cell.letter === tabbableLetter ? 0 : -1}
          data-kk-letter-index-cell={cell.letter}
          sx={cellStyles}
        >
          {cell.letter}
        </ButtonBase>
      ))}
    </Stack>
  );
};
