import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

const FIRST_COUNT = 1;
const COUNT_WIDTH = '3.25rem';

const drop = keyframes`
  0% { transform: translateY(-18%) scale(1.08); }
  100% { transform: translateY(0) scale(1); }
`;

const digitPaint =
  (first: boolean) =>
  (theme: Theme): CSSObject => ({
    display: 'block',
    typography: 'display',
    lineHeight: 0.9,
    fontVariantNumeric: 'tabular-nums',
    animation: `${drop} 140ms ease-out`,
    ...(first ? redInk(theme) : { color: 'text.primary' }),
  });

interface KkStudioCMomentCountProps {
  count: number | null;
  eightLabel: string;
  sx?: KkSx;
}

export const KkStudioCMomentCount: FC<KkStudioCMomentCountProps> = ({ count, eightLabel, sx }) => {
  const digit = count === null ? '–' : `${count}`;
  const beat = `${eightLabel}-${digit}`;

  return (
    <Stack
      data-kk-studio-c-count
      sx={[
        { width: COUNT_WIDTH, flexShrink: 0, alignItems: 'center', rowGap: 0.25 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Typography
        key={beat}
        component="span"
        aria-live="off"
        sx={digitPaint(count === FIRST_COUNT)}
      >
        {digit}
      </Typography>
      <Typography
        component="span"
        sx={{
          typography: 'caption',
          fontWeight: 800,
          lineHeight: 1.2,
          letterSpacing: kkTokens.type.tracking.tight,
          color: 'text.secondary',
          whiteSpace: 'nowrap',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {eightLabel}
      </Typography>
    </Stack>
  );
};
