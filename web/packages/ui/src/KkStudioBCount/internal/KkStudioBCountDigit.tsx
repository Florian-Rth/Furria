import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';
import type { FC } from 'react';
import { redInk } from '../../internal/red-ink';
import { kkTokens } from '../../tokens';

const beat = keyframes`
  0% { transform: scale(1.22); }
  100% { transform: scale(1); }
`;

const digitPaint = (theme: Theme): CSSObject => ({
  ...redInk(theme),
  display: 'block',
  fontFamily: kkTokens.font.display,
  typography: 'h1',
  lineHeight: 1,
  textAlign: 'center',
  fontVariantNumeric: 'tabular-nums',
  transformOrigin: '50% 60%',
  animation: `${beat} 180ms ease-out`,
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
});

const REST = {
  display: 'block',
  fontFamily: kkTokens.font.display,
  typography: 'h1',
  lineHeight: 1,
  textAlign: 'center',
  color: 'text.disabled',
} as const;

const NO_COUNT = '–';

interface KkStudioBCountDigitProps {
  count: number | null;
}

export const KkStudioBCountDigit: FC<KkStudioBCountDigitProps> = ({ count }) => {
  if (count === null) {
    return (
      <Box component="span" aria-hidden sx={REST}>
        {NO_COUNT}
      </Box>
    );
  }

  return (
    <Box key={count} component="span" aria-live="off" sx={digitPaint}>
      {count}
    </Box>
  );
};
