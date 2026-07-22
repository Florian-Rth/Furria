import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import type { FC } from 'react';
import { PROGRAM_EVENTS, resolveEventTint } from '@/features/landing/program-content';
import { ProgramGrid } from './internal/layout/ProgramGrid';
import { ProgramList } from './internal/layout/ProgramList';
import { EventRow } from './internal/ui/EventRow';
import { ProgramCard } from './internal/ui/ProgramCard';
import { ProgramSectionHeader } from './internal/ui/ProgramSectionHeader';

export const ProgramTeaser: FC = () => {
  const theme = useTheme();

  return (
    <Stack component="section" data-kk-program-teaser sx={{ gap: 4 }}>
      <ProgramSectionHeader />
      <ProgramGrid>
        {PROGRAM_EVENTS.map((event, index) => (
          <Grid key={event.startsAt} size={{ xs: 12, md: 4 }}>
            <ProgramCard event={event} tint={resolveEventTint(theme.palette, index)} />
          </Grid>
        ))}
      </ProgramGrid>
      <ProgramList>
        {PROGRAM_EVENTS.map((event, index) => (
          <EventRow
            key={event.startsAt}
            event={event}
            tint={resolveEventTint(theme.palette, index)}
          />
        ))}
      </ProgramList>
    </Stack>
  );
};
