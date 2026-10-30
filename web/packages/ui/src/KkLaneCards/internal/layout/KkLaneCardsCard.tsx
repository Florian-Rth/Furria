import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkLaneCardsCardProps extends PropsWithChildren {
  label: string;
  current: boolean;
}

export const KkLaneCardsCard: FC<KkLaneCardsCardProps> = ({ label, current, children }) => (
  <Box
    component="article"
    aria-label={label}
    aria-roledescription="slide"
    aria-current={current ? 'step' : undefined}
    inert={!current}
    sx={{
      flex: '0 0 100%',
      width: '100%',
      minWidth: 0,
      minHeight: 0,
      scrollSnapAlign: 'start',
      scrollSnapStop: 'always',
      px: 1,
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr)',
      gridTemplateRows: 'minmax(0, 1fr)',
    }}
  >
    <Stack
      sx={(theme) => ({
        minHeight: 0,
        gap: 1,
        p: 1.25,
        borderRadius: `${kkTokens.radius.base}px`,
        backgroundColor: palette(theme).background.paper,
        boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
      })}
    >
      {children}
    </Stack>
  </Box>
);
