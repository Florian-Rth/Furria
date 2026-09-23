import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, KeyboardEvent, MouseEvent } from 'react';
import { useEffect, useRef } from 'react';
import type { KkFilterOption } from './filter-chip-entries';
import { toFilterChipEntries } from './filter-chip-entries';
import { focusRing } from './internal/focus-ring';
import { nextRovingId } from './internal/roving-focus';
import { KkChipScroller } from './KkChipScroller';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const CHIP_ATTRIBUTE = 'data-kk-filter-chip';
const SELECTED_CHIP = `[${CHIP_ATTRIBUTE}][aria-checked="true"]`;
const chipStyles = (theme: Theme): CSSObject => ({
  flexShrink: 0,
  px: 1.75,
  py: 0.75,
  borderWidth: kkTokens.line.hair,
  borderStyle: 'solid',
  borderColor: 'divider',
  borderRadius: `${kkTokens.radius.pill}px`,
  ...theme.typography.caption,
  fontWeight: 800,
  letterSpacing: kkTokens.type.tracking.tight,
  lineHeight: 1.2,
  textTransform: 'none',
  whiteSpace: 'nowrap',
  color: 'text.secondary',
  backgroundColor: 'transparent',
  ...focusRing(theme),
  '&[aria-checked="true"]': {
    color: 'background.paper',
    backgroundColor: 'text.primary',
    borderColor: 'text.primary',
    '&:hover': { backgroundColor: 'text.primary' },
  },
});

interface KkFilterChipsProps {
  label: string;
  options: readonly KkFilterOption[];
  value: string;
  onChange: (id: string) => void;
  sx?: KkSx;
}

export const KkFilterChips: FC<KkFilterChipsProps> = ({ label, options, value, onChange, sx }) => {
  const entries = toFilterChipEntries(options, value);
  const stripRef = useRef<HTMLDivElement>(null);
  const ids = entries.map((entry) => entry.id);
  const tabbableId = entries.find((entry) => entry.selected)?.id ?? ids[0];
  const shownValue = useRef(value);
  useEffect(() => {
    if (shownValue.current === value) {
      return;
    }

    shownValue.current = value;

    const selected = stripRef.current?.querySelector(SELECTED_CHIP) ?? null;

    selected?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [value]);

  const selectEntry = (event: MouseEvent<HTMLElement>): void => {
    const id = event.currentTarget.dataset.kkFilterChip;

    if (id === undefined) {
      return;
    }

    onChange(id);
  };

  const moveSelection = (event: KeyboardEvent<HTMLDivElement>): void => {
    const target = nextRovingId(ids, value, event.key);

    if (target === null) {
      return;
    }

    event.preventDefault();
    onChange(target);
    stripRef.current?.querySelector<HTMLButtonElement>(`[${CHIP_ATTRIBUTE}="${target}"]`)?.focus();
  };

  return (
    <KkChipScroller sx={sx}>
      <Stack
        ref={stripRef}
        direction="row"
        role="radiogroup"
        aria-label={label}
        onKeyDown={moveSelection}
        data-kk-filter-chips
        sx={{ alignItems: 'center', gap: 0.875 }}
      >
        {entries.map((entry) => (
          <ButtonBase
            key={entry.id}
            role="radio"
            aria-checked={entry.selected}
            tabIndex={entry.id === tabbableId ? 0 : -1}
            onClick={selectEntry}
            data-kk-filter-chip={entry.id}
            sx={chipStyles}
          >
            {entry.text}
          </ButtonBase>
        ))}
      </Stack>
    </KkChipScroller>
  );
};
