import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { touchLabPalette } from '../../touch-lab-paint';

interface KkTouchLabReadoutProps {
  x: number;
  y: number;
  value: string;
  detail: string | null;
  badge: string | null;
}

export const KkTouchLabReadout: FC<KkTouchLabReadoutProps> = ({ x, y, value, detail, badge }) => {
  const detailText =
    detail === null ? null : (
      <Typography variant="caption" sx={{ color: 'inherit', opacity: 0.75, whiteSpace: 'nowrap' }}>
        {detail}
      </Typography>
    );
  const badgeText =
    badge === null ? null : (
      <Typography
        variant="caption"
        sx={(theme) => ({
          px: 0.5,
          borderRadius: `${kkTokens.radius.bar}px`,
          backgroundColor: touchLabPalette(theme).warning.main,
          color: touchLabPalette(theme).warning.contrastText,
          fontWeight: 900,
          whiteSpace: 'nowrap',
        })}
      >
        {badge}
      </Typography>
    );

  return (
    <Stack
      direction="row"
      aria-live="polite"
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
        backgroundColor: touchLabPalette(theme).text.primary,
        color: touchLabPalette(theme).background.paper,
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
      {badgeText}
    </Stack>
  );
};
