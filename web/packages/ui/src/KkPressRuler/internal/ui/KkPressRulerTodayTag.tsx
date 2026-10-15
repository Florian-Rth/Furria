import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { TODAY_TAG_GAP } from '../logic/ruler-metrics';

const TAG_DELAY = { animationDelay: '1000ms' };

interface KkPressRulerTodayTagProps {
  label: string;
  x: number;
  width: number;
}

export const KkPressRulerTodayTag: FC<KkPressRulerTodayTagProps> = ({ label, x, width }) => {
  const right = `${width - x + TODAY_TAG_GAP}px`;

  return (
    <Typography
      variant="overline"
      aria-hidden
      data-press="stamp"
      style={TAG_DELAY}
      sx={{
        position: 'absolute',
        top: 0,
        right,
        lineHeight: 1,
        fontWeight: 900,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: 'primary.main',
        pointerEvents: 'none',
      }}
    >
      {label}
    </Typography>
  );
};
