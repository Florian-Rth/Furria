import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { keyframes } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from './tokens';

const float = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
`;

interface KkSealProps {
  dateLabel: string;
  caption: string;
  size?: number;
  rotation?: number;
}

export const KkSeal: FC<KkSealProps> = ({ dateLabel, caption, size = 168, rotation = -8 }) => (
  <Box
    data-kk-seal
    aria-hidden
    sx={{
      width: size,
      height: size,
      flexShrink: 0,
      transform: `rotate(${rotation}deg)`,
    }}
  >
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        animation: `${float} 5s ease-in-out infinite`,
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 120 120"
        sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <Box
          component="circle"
          cx="60"
          cy="60"
          r="57"
          sx={(theme) => ({
            fill: theme.palette.warning.main,
            stroke: theme.palette.text.primary,
            strokeWidth: 3,
          })}
        />
        <Box
          component="circle"
          cx="60"
          cy="60"
          r="50"
          sx={(theme) => ({
            fill: 'none',
            stroke: theme.palette.text.primary,
            strokeWidth: 1,
            strokeDasharray: '2 3',
          })}
        />
      </Box>
      <Stack
        sx={{
          position: 'absolute',
          inset: 0,
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.primary',
        }}
      >
        <Typography
          component="span"
          sx={{ fontFamily: kkTokens.font.display, fontSize: size * 0.34, lineHeight: 0.8 }}
        >
          {dateLabel}
        </Typography>
        <Typography
          component="span"
          sx={{
            fontWeight: 900,
            fontSize: size * 0.08,
            letterSpacing: '0.16em',
            mt: `${size * 0.02}px`,
          }}
        >
          {caption}
        </Typography>
      </Stack>
    </Box>
  </Box>
);
