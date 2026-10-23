import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, KeyboardEvent, MouseEvent } from 'react';
import { focusRing } from '../internal/focus-ring';
import { redInk } from '../internal/red-ink';
import { nextRovingId } from '../internal/roving-focus';
import type { KkIconName } from '../KkIcon';
import { KkIcon } from '../KkIcon';
import type { KkSeverity } from '../KkSeverityGlyph';
import { KkSeverityGlyph } from '../KkSeverityGlyph';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';

export interface KkSegmentSwitchItem {
  id: string;
  label: string;
  icon: KkIconName;
  count: number | null;
  countLabel: string;
  severity?: KkSeverity | null;
}

const ICON_SIZE = '1rem';
const SEGMENT_ATTRIBUTE = 'data-kk-segment';
const MARK_HEIGHT = '0.1875rem';

const segmentPaint = (theme: Theme): CSSObject => ({
  position: 'relative',
  flex: 1,
  [theme.breakpoints.up('md')]: { flex: '0 0 auto', px: 2 },
  minWidth: 0,
  height: '2.25rem',
  gap: 0.5,
  px: 0.5,
  borderRadius: `${kkTokens.radius.base}px`,
  color: 'text.secondary',
  ...focusRing(theme),
  '&::after': {
    content: '""',
    position: 'absolute',
    left: '18%',
    right: '18%',
    bottom: 0,
    height: MARK_HEIGHT,
    borderRadius: `${kkTokens.radius.pill}px`,
    backgroundColor: 'transparent',
  },
  '&[aria-checked="true"]': { color: 'text.primary' },
  '&[aria-checked="true"]::after': { ...redInk(theme), backgroundColor: 'currentColor' },
  '@media (hover: hover)': {
    '&:hover:not([aria-checked="true"])': { color: 'text.primary' },
  },
});

const countPaint =
  (severity: KkSeverity | null) =>
  (theme: Theme): CSSObject => ({
    typography: 'caption',
    fontWeight: 800,
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
    color: 'text.secondary',
    ...(severity === 'conflict' ? redInk(theme) : {}),
  });

interface KkSegmentSwitchProps {
  label: string;
  items: readonly KkSegmentSwitchItem[];
  value: string;
  onChange: (id: string) => void;
  sx?: KkSx;
}

export const KkSegmentSwitch: FC<KkSegmentSwitchProps> = ({
  label,
  items,
  value,
  onChange,
  sx,
}) => {
  const ids = items.map((item) => item.id);
  const choose = (event: MouseEvent<HTMLButtonElement>): void => {
    const id = event.currentTarget.dataset.kkSegment;

    if (id !== undefined) {
      onChange(id);
    }
  };
  const move = (event: KeyboardEvent<HTMLDivElement>): void => {
    const target = nextRovingId(ids, value, event.key);

    if (target === null) {
      return;
    }
    event.preventDefault();
    onChange(target);
    event.currentTarget
      .querySelector<HTMLButtonElement>(`[${SEGMENT_ATTRIBUTE}="${target}"]`)
      ?.focus();
  };
  const segments = items.map((item) => {
    const selected = item.id === value;
    const severity = item.severity ?? null;
    const glyph =
      severity === null || severity === 'met' ? null : <KkSeverityGlyph state={severity} />;
    const count =
      item.count === null ? null : (
        <Box component="span" sx={countPaint(severity)}>
          {item.count}
        </Box>
      );

    return (
      <ButtonBase
        key={item.id}
        role="radio"
        aria-checked={selected}
        aria-label={`${item.label}, ${item.countLabel}`}
        tabIndex={selected ? 0 : -1}
        data-kk-segment={item.id}
        onClick={choose}
        sx={segmentPaint}
      >
        <KkIcon
          name={item.icon}
          sx={{ display: { xs: 'none', md: 'inline-flex' }, width: ICON_SIZE, height: ICON_SIZE }}
        />
        <Box
          component="span"
          sx={{ typography: 'body2', fontWeight: 800, lineHeight: 1, whiteSpace: 'nowrap' }}
        >
          {item.label}
        </Box>
        {glyph}
        {count}
      </ButtonBase>
    );
  });

  return (
    <Stack
      direction="row"
      role="radiogroup"
      aria-label={label}
      onKeyDown={move}
      data-kk-segment-switch
      sx={[
        { flex: 1, minWidth: 0, gap: 0, alignItems: 'stretch' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {segments}
    </Stack>
  );
};
