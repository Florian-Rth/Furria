import { KkSection } from '@furria/ui';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import type { FC } from 'react';
import { SectionActionLink } from '@/components/SectionActionLink';
import {
  PROGRAM_EVENTS,
  programAllLabel,
  programHeading,
  resolveEventTint,
} from '@/features/landing/program-content';
import { ProgramGrid } from './internal/layout/ProgramGrid';
import { ProgramList } from './internal/layout/ProgramList';
import { EventRow } from './internal/ui/EventRow';
import { ProgramCard } from './internal/ui/ProgramCard';

export const ProgramTeaser: FC = () => {
  const theme = useTheme();

  return (
    <KkSection>
      <KkSection.Header
        title={programHeading}
        action={<SectionActionLink to="/program">{programAllLabel}</SectionActionLink>}
      />
      <ProgramGrid>
        {PROGRAM_EVENTS.map((event, index) => (
          <Grid key={event.startsAt} size={{ xs: 12, md: 4 }}>
            <ProgramCard event={event} tint={resolveEventTint(theme, index)} />
          </Grid>
        ))}
      </ProgramGrid>
      <ProgramList>
        {PROGRAM_EVENTS.map((event, index) => (
          <EventRow key={event.startsAt} event={event} tint={resolveEventTint(theme, index)} />
        ))}
      </ProgramList>
    </KkSection>
  );
};
