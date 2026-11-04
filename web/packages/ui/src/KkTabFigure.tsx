import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { goldInkOf } from './internal/gold-ink';
import { KkIcon } from './KkIcon';
import { stepFigures } from './KkStatePill/state-paint';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export type KkTabFigureSize = 'small' | 'medium';

const VALUE_VARIANTS: Record<KkTabFigureSize, 'h1' | 'h3'> = { small: 'h3', medium: 'h1' };

interface KkTabFigureProps {
  label: string;
  value: string;
  detail?: string;
  attention?: string | null;
  settled?: boolean;
  size?: KkTabFigureSize;
  sx?: KkSx;
}

export const KkTabFigure: FC<KkTabFigureProps> = ({
  label,
  value,
  detail,
  attention = null,
  settled = false,
  size = 'medium',
  sx,
}) => {
  const detailLine =
    detail === undefined ? null : (
      <Box
        component="span"
        sx={{ ...stepFigures, typography: 'body2', lineHeight: 1.3, color: 'text.secondary' }}
      >
        {detail}
      </Box>
    );
  const attentionLine =
    attention === null ? null : (
      <Stack
        direction="row"
        component="span"
        sx={(theme) => ({
          ...stepFigures,
          alignItems: 'center',
          gap: 0.5,
          typography: 'body2',
          fontWeight: 800,
          lineHeight: 1.3,
          ...goldInkOf(theme),
        })}
      >
        <KkIcon name="clock" size="small" />
        {attention}
      </Stack>
    );

  return (
    <Stack data-kk-tab-figure sx={[{ minWidth: 0, gap: 0.25 }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Box
        component="span"
        sx={{
          typography: 'overline',
          fontWeight: 800,
          letterSpacing: kkTokens.type.tracking.label,
          textTransform: 'uppercase',
          lineHeight: 1.2,
          color: 'text.secondary',
        }}
      >
        {label}
      </Box>
      <Box
        component="span"
        sx={{
          ...stepFigures,
          typography: VALUE_VARIANTS[size],
          lineHeight: 1,
          color: settled ? 'text.secondary' : 'text.primary',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </Box>
      {detailLine}
      {attentionLine}
    </Stack>
  );
};
