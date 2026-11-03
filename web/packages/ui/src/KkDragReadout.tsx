import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from './tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkDragReadoutProps {
  x: number;
  y: number;
  value: string;
  detail: string | null;
}

export const KkDragReadout: FC<KkDragReadoutProps> = ({ x, y, value, detail }) => {
  const detailText =
    detail === null ? null : (
      <Typography variant="caption" sx={{ color: 'inherit', opacity: 0.75, whiteSpace: 'nowrap' }}>
        {detail}
      </Typography>
    );

  return (
    <Stack
      direction="row"
      data-kk-drag-readout
      style={{ left: x, top: y }}
      sx={(theme) => ({
        position: 'absolute',
        zIndex: 5,
        transform: 'translate(-50%, -50%)',
        px: 1.25,
        py: 0.5,
        alignItems: 'center',
        gap: 0.75,
        pointerEvents: 'none',
        borderRadius: `${kkTokens.radius.chip}px`,
        backgroundColor: palette(theme).text.primary,
        color: palette(theme).background.paper,
        boxShadow: kkTokens.shadow.floating,
      })}
    >
      <Typography
        variant="body2"
        sx={{
          fontWeight: 900,
          fontVariantNumeric: 'tabular-nums',
          color: 'inherit',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </Typography>
      {detailText}
    </Stack>
  );
};
