import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import type { KkStudioIStagePoint } from './KkStudioIStagePaths';

const PERCENT = 100;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export interface KkStudioIStageGhost extends KkStudioIStagePoint {
  key: string;
}

interface KkStudioIStageOnionProps {
  ghosts: readonly KkStudioIStageGhost[];
}

export const KkStudioIStageOnion: FC<KkStudioIStageOnionProps> = ({ ghosts }) => {
  const rings = ghosts.map((ghost) => (
    <Box
      key={ghost.key}
      style={{
        transform: `translate3d(calc(${ghost.x * PERCENT}cqw - 50%), calc(${ghost.y * PERCENT}cqh - 50%), 0)`,
      }}
      sx={(theme) => ({
        position: 'absolute',
        left: 0,
        top: 0,
        width: { xs: '1.125rem', desktop: '1.5rem' },
        height: { xs: '1.125rem', desktop: '1.5rem' },
        borderRadius: '50%',
        border: `1.5px solid ${palette(theme).text.disabled}`,
        backgroundColor: `color-mix(in srgb, ${palette(theme).text.disabled} 12%, transparent)`,
      })}
    />
  ));

  return (
    <Box aria-hidden data-kk-studio-i-onion sx={{ position: 'absolute', inset: 0 }}>
      {rings}
    </Box>
  );
};
