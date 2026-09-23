import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkBroomMark } from './KkBroomMark';
import { KkEyebrow } from './KkEyebrow';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

type KkBrandLockupSize = 'sm' | 'lg';
type KkBrandLockupVariant = 'h4' | 'h2';

interface KkBrandLockupProps {
  size?: KkBrandLockupSize;
  eyebrow?: string;
  sx?: KkSx;
}

interface KkBrandLockupStyle {
  markSize: number;
  variant: KkBrandLockupVariant;
  gap: number;
}

const sizeStyles: Record<KkBrandLockupSize, KkBrandLockupStyle> = {
  sm: { markSize: 30, variant: 'h4', gap: 1.25 },
  lg: { markSize: 44, variant: 'h2', gap: 1.75 },
};

export const KkBrandLockup: FC<KkBrandLockupProps> = ({ size = 'sm', eyebrow, sx }) => {
  const { markSize, variant, gap } = sizeStyles[size];
  const eyebrowLine = eyebrow === undefined ? null : <KkEyebrow tone="muted">{eyebrow}</KkEyebrow>;

  return (
    <Stack
      direction="row"
      data-kk-brand-lockup
      sx={[{ alignItems: 'center', gap, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <KkBroomMark size={markSize} sx={{ color: 'primary.main', flexShrink: 0 }} />
      <Stack sx={{ minWidth: 0 }}>
        <Typography
          variant={variant}
          component="span"
          sx={{ color: 'text.primary', letterSpacing: kkTokens.type.tracking.label, lineHeight: 1 }}
        >
          FURRIA
        </Typography>
        {eyebrowLine}
      </Stack>
    </Stack>
  );
};
