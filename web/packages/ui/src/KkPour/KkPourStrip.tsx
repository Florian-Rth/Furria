import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { goldInkOf } from '../internal/gold-ink';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';
import { KkPourStateGlyph } from './KkPourStateGlyph';

export interface KkPourStripAction {
  label: string;
  onSelect: () => void;
}

interface KkPourStripProps {
  amount: string | null;
  facts: string;
  attention: boolean;
  action: KkPourStripAction | null;
  sx?: KkSx;
}

export const KkPourStrip: FC<KkPourStripProps> = ({ amount, facts, attention, action, sx }) => {
  const glyphState = attention ? 'overdue' : 'open';
  const figure =
    amount === null ? (
      <KkPourStateGlyph state="paid" />
    ) : (
      <Typography
        variant="h4"
        component="span"
        noWrap
        sx={{ fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}
      >
        {amount}
      </Typography>
    );
  const glyph = amount === null ? null : <KkPourStateGlyph state={glyphState} />;
  const button =
    action === null ? null : (
      <Button
        variant="contained"
        size="small"
        onClick={action.onSelect}
        data-kk-pour-pay
        sx={{
          flexShrink: 0,
          minHeight: '2rem',
          px: 1.5,
          borderRadius: `${kkTokens.radius.pill}px`,
          fontWeight: 900,
          boxShadow: 'none',
        }}
      >
        {action.label}
      </Button>
    );

  return (
    <Stack
      direction="row"
      data-kk-pour-strip
      sx={[
        { alignItems: 'center', gap: 1, flex: 1, minWidth: 0, pl: 0.5 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {glyph}
      {figure}
      <Typography
        variant="caption"
        noWrap
        sx={[
          { flex: 1, minWidth: 0, fontWeight: 700, color: 'text.secondary' },
          attention ? goldInkOf : {},
        ]}
      >
        {facts}
      </Typography>
      {button}
    </Stack>
  );
};
