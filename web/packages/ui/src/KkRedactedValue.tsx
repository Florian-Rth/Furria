import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { inkWash } from './internal/ink-wash';
import { KkEyebrow } from './KkEyebrow';
import { kkTokens } from './tokens';

const LABEL_FONT_SIZE = '0.5625rem';
const BAR_WIDTH = 34;
const BAR_HEIGHT = 8;
const BAR_WASH = '18%';
const BAR_DASH = '3px';
const BAR_GAP = '6px';

interface KkRedactedValueProps {
  label: string;
  placeholder: string;
}

export const KkRedactedValue: FC<KkRedactedValueProps> = ({ label, placeholder }) => (
  <Stack data-kk-redacted-value sx={{ minWidth: 0, gap: 0.625 }}>
    <KkEyebrow tone="muted" sx={{ fontSize: LABEL_FONT_SIZE, whiteSpace: 'nowrap' }}>
      {label}
    </KkEyebrow>
    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.875, minWidth: 0 }}>
      <Box
        aria-hidden
        sx={(theme) => ({
          width: BAR_WIDTH,
          height: BAR_HEIGHT,
          flexShrink: 0,
          borderRadius: `${kkTokens.radius.pill}px`,
          backgroundImage: `repeating-linear-gradient(90deg, ${inkWash(theme, BAR_WASH)} 0 ${BAR_DASH}, transparent ${BAR_DASH} ${BAR_GAP})`,
        })}
      />
      <Typography
        component="span"
        sx={{
          fontFamily: kkTokens.font.body,
          fontSize: '0.6875rem',
          fontWeight: 800,
          letterSpacing: '0.02em',
          lineHeight: 1.2,
          color: 'text.disabled',
          whiteSpace: 'nowrap',
        }}
      >
        {placeholder}
      </Typography>
    </Stack>
  </Stack>
);
