import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import type { FC } from 'react';
import { PROGRAM_EVENTS } from '@/features/landing/program-content';
import { ProgramGrid } from './internal/layout/ProgramGrid';
import { ProgramCard } from './internal/ui/ProgramCard';
import { ProgramSectionHeader } from './internal/ui/ProgramSectionHeader';

export const ProgramTeaser: FC = () => {
  const theme = useTheme();
  const tintForPosition = (index: number): string => {
    if (index === 0) {
      return theme.palette.primary.main;
    }
    if (index === 1) {
      return theme.palette.warning.main;
    }
    return theme.palette.text.primary;
  };

  return (
    <Stack component="section" data-kk-program-teaser sx={{ gap: 4 }}>
      <ProgramSectionHeader />
      <ProgramGrid>
        {PROGRAM_EVENTS.map((event, index) => (
          <Grid key={event.startsAt} size={{ xs: 12, md: 4 }}>
            <ProgramCard event={event} tint={tintForPosition(index)} />
          </Grid>
        ))}
      </ProgramGrid>
    </Stack>
  );
};
