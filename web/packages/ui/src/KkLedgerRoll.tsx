import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { keyframes } from '@mui/material/styles';
import type { FC } from 'react';
import { stepFigures } from './KkStatePill/state-paint';
import type { KkSx } from './kk-sx';

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;
const CELL = '1.12em';
const LAP_CELLS = DIGITS.length;
const ROLL_MS = 1100;
const STAGGER_MS = 70;

const stampDrop = keyframes`
  0% {
    opacity: 0;
    transform: translate(-50%, -140%) scale(1.5);
  }
  22% {
    opacity: 1;
    transform: translate(-50%, -105%) scale(1);
  }
  70% {
    opacity: 1;
    transform: translate(-50%, -105%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -10%) scale(0.55);
  }
`;

interface KkLedgerRollProps {
  value: string;
  spin: number;
  stamp?: string | null;
  sx?: KkSx;
}

const isDigit = (character: string): boolean => character >= '0' && character <= '9';

export const KkLedgerRoll: FC<KkLedgerRollProps> = ({ value, spin, stamp = null, sx }) => {
  const characters = [...value];
  const lap = spin % 2;
  const cells = [...DIGITS, ...DIGITS].map((digit, index) => (
    <Box key={`${digit}-${index < LAP_CELLS ? 'a' : 'b'}`} component="span" sx={{ height: CELL }}>
      {digit}
    </Box>
  ));
  const columns = characters.map((character, index) => {
    const fromRight = characters.length - index;

    if (!isDigit(character)) {
      return (
        <Box key={`sign-${fromRight}`} component="span" sx={{ height: CELL }}>
          {character}
        </Box>
      );
    }

    const cell = Number(character) + lap * LAP_CELLS;
    const delay = (fromRight - 1) * STAGGER_MS;

    return (
      <Box
        key={`digit-${fromRight}`}
        component="span"
        sx={{ display: 'inline-block', height: CELL, clipPath: 'inset(0)' }}
      >
        <Stack
          component="span"
          sx={{
            transform: `translateY(calc(${-cell} * ${CELL}))`,
            transition: `transform ${ROLL_MS}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
          }}
        >
          {cells}
        </Stack>
      </Box>
    );
  });
  const stampMark =
    stamp === null || spin === 0 ? null : (
      <Box
        key={spin}
        component="span"
        aria-hidden
        sx={{
          position: 'absolute',
          left: '50%',
          top: 0,
          typography: 'h4',
          color: 'text.primary',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          opacity: 0,
          animation: `${stampDrop} 1000ms cubic-bezier(0.22, 0.61, 0.36, 1) both`,
        }}
      >
        {stamp}
      </Box>
    );

  return (
    <Box
      component="span"
      role="img"
      aria-label={value}
      data-kk-ledger-roll
      sx={[
        {
          ...stepFigures,
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'flex-start',
          lineHeight: CELL,
          whiteSpace: 'nowrap',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {columns}
      {stampMark}
    </Box>
  );
};
