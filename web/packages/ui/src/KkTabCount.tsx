import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, KeyboardEvent, MouseEvent } from 'react';
import { focusRing } from './internal/focus-ring';
import { inkWashSurface } from './internal/ink-wash';
import { nextRovingId } from './internal/roving-focus';
import { stepFigures } from './KkStatePill/state-paint';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export type KkTabCountSize = 'medium' | 'large';

const SEGMENT_ATTRIBUTE = 'data-kk-tab-count';

const HEIGHTS: Record<KkTabCountSize, string> = { medium: '2.75rem', large: '4.25rem' };
const NUMERALS: Record<KkTabCountSize, 'h3' | 'h1'> = { medium: 'h3', large: 'h1' };

const segmentPaint =
  (size: KkTabCountSize) =>
  (theme: Theme): CSSObject => ({
    flex: 1,
    minWidth: 0,
    height: HEIGHTS[size],
    gap: 0.75,
    borderRadius: `${kkTokens.radius.base - 4}px`,
    color: 'text.secondary',
    transition: 'background-color 160ms ease-out, color 160ms ease-out',
    ...focusRing(theme),
    '&[aria-checked="true"]': { color: 'background.paper', backgroundColor: 'text.primary' },
    '&.Mui-disabled': { color: 'text.disabled' },
    '@media (hover: hover)': {
      '&:hover:not([aria-checked="true"])': {
        ...inkWashSurface(theme, '6%', '10%'),
        color: 'text.primary',
      },
    },
  });

export interface KkTabCountOption {
  value: number;
  label: string;
  caption?: string;
  disabled?: boolean;
}

interface KkTabCountProps {
  label: string;
  options: readonly KkTabCountOption[];
  value: number;
  onChange: (value: number) => void;
  size?: KkTabCountSize;
  sx?: KkSx;
}

export const KkTabCount: FC<KkTabCountProps> = ({
  label,
  options,
  value,
  onChange,
  size = 'medium',
  sx,
}) => {
  const ids = options.filter((option) => option.disabled !== true).map(String);
  const choose = (event: MouseEvent<HTMLButtonElement>): void => {
    const chosen = Number(event.currentTarget.dataset.kkTabCount);

    if (Number.isFinite(chosen)) {
      onChange(chosen);
    }
  };
  const move = (event: KeyboardEvent<HTMLDivElement>): void => {
    const target = nextRovingId(ids, String(value), event.key);

    if (target === null) {
      return;
    }
    event.preventDefault();
    onChange(Number(target));
    event.currentTarget
      .querySelector<HTMLButtonElement>(`[${SEGMENT_ATTRIBUTE}="${target}"]`)
      ?.focus();
  };
  const segments = options.map((option) => {
    const selected = option.value === value;
    const unitLabel =
      size === 'large' && option.caption !== undefined ? (
        <Box
          component="span"
          aria-hidden
          sx={{ typography: 'caption', fontWeight: 800, lineHeight: 1, color: 'inherit' }}
        >
          {option.caption}
        </Box>
      ) : null;

    return (
      <ButtonBase
        key={option.value}
        role="radio"
        aria-checked={selected}
        aria-label={option.label}
        tabIndex={selected ? 0 : -1}
        disabled={option.disabled}
        data-kk-tab-count={option.value}
        onClick={choose}
        sx={segmentPaint(size)}
      >
        <Box
          component="span"
          aria-hidden
          sx={{ ...stepFigures, typography: NUMERALS[size], lineHeight: 1, color: 'inherit' }}
        >
          {option.value}
        </Box>
        {unitLabel}
      </ButtonBase>
    );
  });

  return (
    <Stack
      direction="row"
      role="radiogroup"
      aria-label={label}
      onKeyDown={move}
      data-kk-tab-count-group
      sx={[
        {
          gap: 0.5,
          p: 0.5,
          minWidth: 0,
          borderRadius: `${kkTokens.radius.base}px`,
          borderWidth: kkTokens.line.hair,
          borderStyle: 'solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {segments}
    </Stack>
  );
};
