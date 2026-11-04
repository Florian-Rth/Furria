import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { rowDividerTop } from '../internal/row-divider';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';
import type { KkPourTabState } from './KkPourStateGlyph';
import { KkPourStateGlyph } from './KkPourStateGlyph';

const DATE_COLUMN = '4.5rem';

interface KkPourTabLineProps {
  date: string;
  text: string;
  note: string | null;
  amount: string;
  state: KkPourTabState;
  marked?: boolean;
  sx?: KkSx;
}

export const KkPourTabLine: FC<KkPourTabLineProps> = ({
  date,
  text,
  note,
  amount,
  state,
  marked = false,
  sx,
}) => {
  const noteLine =
    note === null ? null : (
      <Typography variant="caption" noWrap sx={{ color: 'text.secondary', lineHeight: 1.3 }}>
        {note}
      </Typography>
    );

  return (
    <Stack
      direction="row"
      data-kk-pour-tab-line={state}
      data-marked={marked}
      sx={[
        (theme) => ({
          alignItems: 'center',
          gap: 1,
          minHeight: '2.5rem',
          py: 0.5,
          ...rowDividerTop,
          ...(marked
            ? {
                boxShadow: `inset 0.1875rem 0 0 ${(theme.vars ?? theme).palette.primary.main}`,
                pl: 1,
              }
            : {}),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <KkPourStateGlyph state={state} />
      <Typography
        variant="caption"
        sx={{
          width: DATE_COLUMN,
          flexShrink: 0,
          fontWeight: 700,
          color: 'text.secondary',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {date}
      </Typography>
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>
          {text}
        </Typography>
        {noteLine}
      </Stack>
      <Typography
        variant="body2"
        sx={{
          flexShrink: 0,
          fontWeight: 800,
          fontVariantNumeric: 'tabular-nums',
          color: state === 'paid' ? 'text.secondary' : 'text.primary',
          minWidth: kkTokens.tapTarget,
          textAlign: 'right',
        }}
      >
        {amount}
      </Typography>
    </Stack>
  );
};
