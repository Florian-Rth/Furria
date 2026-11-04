import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../internal/focus-ring';
import { goldInkOf } from '../internal/gold-ink';
import { inkWash } from '../internal/ink-wash';
import { rowDividerTop } from '../internal/row-divider';
import { KkAvatar } from '../KkAvatar/KkAvatar';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';
import type { KkPourTabState } from './KkPourStateGlyph';
import { KkPourStateGlyph } from './KkPourStateGlyph';

const FIGURE_COLUMN = '5rem';

const rowPaint =
  (selected: boolean) =>
  (theme: Theme): CSSObject => ({
    width: '100%',
    justifyContent: 'flex-start',
    textAlign: 'left',
    gap: 1,
    minHeight: kkTokens.tapTarget,
    py: 0.75,
    px: 0.5,
    ...rowDividerTop,
    ...focusRing(theme),
    ...(selected ? { backgroundColor: inkWash(theme, '6%') } : {}),
    '@media (hover: hover)': { '&:hover': { backgroundColor: inkWash(theme, '4%') } },
  });

interface KkPourRosterRowProps {
  initials: string;
  name: string;
  state: KkPourTabState;
  facts: string;
  amount: string | null;
  count: string | null;
  selected: boolean;
  onSelect: () => void;
  sx?: KkSx;
}

export const KkPourRosterRow: FC<KkPourRosterRowProps> = ({
  initials,
  name,
  state,
  facts,
  amount,
  count,
  selected,
  onSelect,
  sx,
}) => {
  const attention = state === 'overdue';

  return (
    <ButtonBase
      onClick={onSelect}
      data-kk-pour-roster-row={state}
      aria-current={selected ? 'true' : undefined}
      sx={[rowPaint(selected), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <KkPourStateGlyph state={state} />
      <KkAvatar initials={initials} size="small" />
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" noWrap sx={{ fontWeight: 800 }}>
          {name}
        </Typography>
        <Typography
          variant="caption"
          noWrap
          sx={[{ color: 'text.secondary', lineHeight: 1.3 }, attention ? goldInkOf : {}]}
        >
          {facts}
        </Typography>
      </Stack>
      <Stack sx={{ minWidth: FIGURE_COLUMN, flexShrink: 0, alignItems: 'flex-end' }}>
        <Typography variant="body2" sx={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
          {amount}
        </Typography>
        <Typography
          variant="caption"
          noWrap
          sx={{ color: 'text.secondary', lineHeight: 1.3, fontVariantNumeric: 'tabular-nums' }}
        >
          {count}
        </Typography>
      </Stack>
    </ButtonBase>
  );
};
