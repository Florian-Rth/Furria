import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

const PERCENT = 100;
const GAP = '2px';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export interface KkStudioIWaveBandPiece {
  key: string;
  from: number;
  to: number;
  label: string;
}

interface KkStudioIWaveBandProps {
  pieces: readonly KkStudioIWaveBandPiece[];
}

export const KkStudioIWaveBand: FC<KkStudioIWaveBandProps> = ({ pieces }) => {
  const shown = pieces.map((piece) => (
    <Box
      key={piece.key}
      style={{
        left: `calc(${piece.from * PERCENT}% + ${GAP})`,
        width: `calc(${(piece.to - piece.from) * PERCENT}% - 2 * ${GAP})`,
      }}
      sx={(theme) => ({
        position: 'absolute',
        top: 0,
        bottom: 0,
        display: 'grid',
        alignItems: 'center',
        px: 0.75,
        borderRadius: `${kkTokens.radius.bar}px`,
        backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 10%, transparent)`,
        boxShadow: `inset 0 ${kkTokens.line.section}px 0 ${palette(theme).text.primary}`,
      })}
    >
      <Typography
        component="span"
        variant="caption"
        sx={{
          lineHeight: 1,
          fontWeight: 800,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {piece.label}
      </Typography>
    </Box>
  ));

  return (
    <Box
      aria-hidden
      data-kk-studio-i-band
      sx={{ position: 'absolute', left: 0, right: 0, bottom: '0.25rem', height: '1.125rem' }}
    >
      {shown}
    </Box>
  );
};
