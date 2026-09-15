import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, KeyboardEvent, MouseEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { focusRing } from './internal/focus-ring';
import { nextRovingId } from './internal/roving-focus';
import type { KkSx } from './kk-sx';
import { letterIndexCurrentPaint } from './letter-index-cell-paint';
import type { KkLetterIndexEntry } from './letter-index-cells';
import { toLetterIndexCells } from './letter-index-cells';
import type { KkLetterIndexVariant } from './letter-index-variant';
import { toLetterIndexBehaviour } from './letter-index-variant';
import { kkTokens } from './tokens';

const CELL_WIDTH_TOUCH = 32;
const CELL_HEIGHT_TOUCH = 38;
const CELL_SIZE_COMPACT = 25;
const CELL_SIZE_RAIL = 26;
const CELL_FONT_SIZE = '0.8125rem';
const CELL_ATTRIBUTE = 'data-kk-letter-index-cell';
const CURRENT_CELL = `[${CELL_ATTRIBUTE}][aria-current="location"]`;
const UNDERLINE_WIDTH = '58%';
const UNDERLINE_INSET = '14%';

const flowingCellSize = (theme: Theme): CSSObject => ({
  width: CELL_WIDTH_TOUCH,
  height: CELL_HEIGHT_TOUCH,
  minWidth: CELL_WIDTH_TOUCH,
  minHeight: CELL_HEIGHT_TOUCH,
  borderRadius: `${kkTokens.radius.pill}px`,
  [theme.breakpoints.up('sm')]: {
    width: CELL_SIZE_COMPACT,
    height: CELL_SIZE_COMPACT,
    minWidth: CELL_SIZE_COMPACT,
    minHeight: CELL_SIZE_COMPACT,
    borderRadius: '50%',
  },
});

const railCellSize: CSSObject = {
  width: CELL_SIZE_RAIL,
  height: CELL_SIZE_RAIL,
  maxHeight: CELL_SIZE_RAIL,
  minWidth: CELL_SIZE_RAIL,
  minHeight: 0,
  flexShrink: 1,
  borderRadius: '50%',
};

const cellSizes: Record<KkLetterIndexVariant, (theme: Theme) => CSSObject> = {
  grid: flowingCellSize,
  strip: flowingCellSize,
  rail: () => railCellSize,
};

const cellStyles =
  (variant: KkLetterIndexVariant) =>
  (theme: Theme): CSSObject => ({
    position: 'relative',
    flexShrink: 0,
    padding: 0,
    ...cellSizes[variant](theme),
    fontFamily: kkTokens.font.display,
    fontSize: CELL_FONT_SIZE,
    fontWeight: kkTokens.font.displayWeight,
    letterSpacing: kkTokens.type.tracking.display,
    lineHeight: 1,
    color: (theme.vars ?? theme).palette.text.primary,
    backgroundColor: 'transparent',
    ...focusRing(theme),
    '&.Mui-disabled': {
      color: (theme.vars ?? theme).palette.text.disabled,
    },
    '&[aria-current="location"]': {
      ...letterIndexCurrentPaint(theme),
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

const variantLayout: Record<KkLetterIndexVariant, KkSx> = {
  grid: { flexWrap: 'wrap' },
  strip: {
    flexWrap: { xs: 'wrap', sm: 'nowrap' },
    gap: { xs: 0.75, sm: 0.5 },
    overflowX: { xs: 'visible', sm: 'auto' },
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
  },
  rail: {
    flexDirection: 'column',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    gap: 0,
    height: '100%',
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
  const behaviour = toLetterIndexBehaviour(variant);
  const stripRef = useRef<HTMLDivElement>(null);
  const [focusedLetter, setFocusedLetter] = useState<string | null>(null);

  const reachable = cells.filter((cell) => !cell.disabled).map((cell) => cell.letter);
  const fallbackLetter = reachable.find((letter) => letter === current) ?? reachable[0];
  const tabbableLetter =
    focusedLetter !== null && reachable.includes(focusedLetter) ? focusedLetter : fallbackLetter;
  const orientation = behaviour.fixed ? 'vertical' : undefined;
  const paintCell = cellStyles(variant);

  useEffect(() => {
    if (!behaviour.scrolls) {
      return;
    }

    const marked = stripRef.current?.querySelector(CURRENT_CELL) ?? null;

    marked?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [current, behaviour.scrolls]);

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
      aria-orientation={orientation}
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
          sx={paintCell}
        >
          {cell.letter}
        </ButtonBase>
      ))}
    </Stack>
  );
};
