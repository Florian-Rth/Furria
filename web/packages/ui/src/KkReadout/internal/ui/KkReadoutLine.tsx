import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import { rowDividerTop } from '../../../internal/row-divider';
import type { KkStatusLevel } from '../../../internal/status-paint';
import { kkTokens } from '../../../tokens';
import { KkReadoutTick } from './KkReadoutTick';

interface KkReadoutLineProps {
  title: string;
  meta?: string;
  reason?: string;
  trailing?: string;
  level?: KkStatusLevel;
}

export const KkReadoutLine: FC<KkReadoutLineProps> = ({ title, meta, reason, trailing, level }) => {
  const tick = level === undefined ? null : <KkReadoutTick level={level} />;
  const metaLine =
    meta === undefined ? null : (
      <Typography component="span" sx={{ typography: 'caption', color: 'text.secondary' }}>
        {meta}
      </Typography>
    );
  const reasonLine =
    reason === undefined ? null : (
      <Typography
        component="span"
        sx={(theme) => ({ ...theme.typography.caption, fontWeight: 700, ...redInk(theme) })}
      >
        {reason}
      </Typography>
    );
  const trailingSlot =
    trailing === undefined ? null : (
      <Typography
        component="span"
        sx={{
          typography: 'caption',
          fontWeight: 800,
          fontVariantNumeric: 'tabular-nums',
          color: 'text.disabled',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {trailing}
      </Typography>
    );

  return (
    <Stack
      component="li"
      direction="row"
      data-kk-readout-line
      sx={{ alignItems: 'baseline', columnGap: 1, minWidth: 0, py: 0.75, ...rowDividerTop }}
    >
      {tick}
      <Stack sx={{ flexGrow: 1, minWidth: 0, rowGap: 0.125 }}>
        <Typography
          component="span"
          sx={{
            typography: 'body2',
            fontWeight: 800,
            letterSpacing: kkTokens.type.tracking.tight,
            overflowWrap: 'anywhere',
          }}
        >
          {title}
        </Typography>
        {metaLine}
        {reasonLine}
      </Stack>
      {trailingSlot}
    </Stack>
  );
};
