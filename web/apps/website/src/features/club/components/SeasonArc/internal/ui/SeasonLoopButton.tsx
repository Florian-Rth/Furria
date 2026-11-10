import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { seasonLoopGlyph, seasonLoopLabel } from '@/features/club/season-content';

interface SeasonLoopButtonProps {
  onLoopBack: () => void;
}

export const SeasonLoopButton: FC<SeasonLoopButtonProps> = ({ onLoopBack }) => (
  <Typography
    variant="inherit"
    component="button"
    type="button"
    aria-label={seasonLoopLabel}
    onClick={onLoopBack}
    data-kk-season-loop
    sx={(theme) => ({
      display: 'inline',
      p: 0,
      border: 0,
      bgcolor: 'transparent',
      color: 'inherit',
      cursor: 'pointer',
      position: 'relative',
      '&::after': { content: '""', position: 'absolute', inset: theme.spacing(-1.5) },
      transition: theme.transitions.create('color', {
        duration: theme.transitions.duration.shortest,
      }),
      '&:hover': { color: 'primary.main' },
      '&:focus-visible': {
        outlineWidth: 2,
        outlineStyle: 'solid',
        outlineColor: (theme.vars ?? theme).palette.primary.main,
        outlineOffset: 2,
      },
    })}
  >
    {seasonLoopGlyph}
  </Typography>
);
