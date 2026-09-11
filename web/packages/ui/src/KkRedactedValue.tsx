import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { inkWash } from './internal/ink-wash';
import { KkEyebrow } from './KkEyebrow';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

type KkRedactedWidth = 'short' | 'medium' | 'long';

const BAR_HEIGHT = 8;
const BAR_WASH_LIGHT = '26%';
const BAR_WASH_DARK = '34%';
const BAR_DASH = '3px';
const BAR_GAP = '6px';

const barWidths: Record<KkRedactedWidth, number> = { short: 22, medium: 34, long: 52 };

const dashes = (color: string): string =>
  `repeating-linear-gradient(90deg, ${color} 0 ${BAR_DASH}, transparent ${BAR_DASH} ${BAR_GAP})`;

interface KkRedactedValueProps {
  label: string;
  placeholder: string;
  width?: KkRedactedWidth;
  sx?: KkSx;
}

export const KkRedactedValue: FC<KkRedactedValueProps> = ({
  label,
  placeholder,
  width = 'medium',
  sx,
}) => (
  <Stack
    data-kk-redacted-value
    sx={[{ minWidth: 0, gap: 0.625 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    <KkEyebrow tone="muted" size="small" sx={{ whiteSpace: 'nowrap' }}>
      {label}
    </KkEyebrow>
    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.875, minWidth: 0 }}>
      <Box
        aria-hidden
        sx={(theme) => ({
          width: barWidths[width],
          height: BAR_HEIGHT,
          flexShrink: 0,
          borderRadius: `${kkTokens.radius.pill}px`,
          backgroundImage: dashes(inkWash(theme, BAR_WASH_LIGHT)),
          ...theme.applyStyles('dark', {
            backgroundImage: dashes(inkWash(theme, BAR_WASH_DARK)),
          }),
        })}
      />
      <Typography
        component="span"
        sx={{
          fontFamily: kkTokens.font.body,
          fontSize: kkTokens.type.chip,
          fontWeight: 800,
          letterSpacing: '0.02em',
          lineHeight: 1.2,
          color: 'text.secondary',
          whiteSpace: 'nowrap',
        }}
      >
        {placeholder}
      </Typography>
    </Stack>
  </Stack>
);
