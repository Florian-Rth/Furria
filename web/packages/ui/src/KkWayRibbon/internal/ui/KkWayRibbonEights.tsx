import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const clampShare = (value: number): number => Math.min(1, Math.max(0, value));

interface KkWayRibbonEightsProps {
  eights: number;
  fill: number;
  current: boolean;
}

export const KkWayRibbonEights: FC<KkWayRibbonEightsProps> = ({ eights, fill, current }) => {
  const cells = Array.from({ length: eights }, (_, index) => {
    const share = clampShare(fill * eights - index);
    const lit = { transform: `scaleX(${share})` };

    return (
      <Box
        key={index}
        sx={(theme) => ({
          position: 'relative',
          flex: 1,
          height: '0.375rem',
          borderRadius: `${kkTokens.radius.pill}px`,
          backgroundColor: palette(theme).divider,
          overflow: 'clip',
        })}
      >
        <Box
          style={lit}
          sx={(theme) => ({
            position: 'absolute',
            inset: 0,
            transformOrigin: 'left center',
            backgroundColor: current ? palette(theme).primary.main : palette(theme).text.disabled,
          })}
        />
      </Box>
    );
  });

  return (
    <Stack direction="row" aria-hidden sx={{ gap: 0.375, width: '100%' }}>
      {cells}
    </Stack>
  );
};
