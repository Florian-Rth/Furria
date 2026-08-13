import { KkSection } from '@furria/ui';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import type { FC } from 'react';
import { SectionActionLink } from '@/components/SectionActionLink';
import { useTeaserEvents } from '@/features/landing/hooks/use-teaser-events';
import {
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
  const events = useTeaserEvents();

  return (
    <KkSection>
      <KkSection.Header
        title={programHeading}
        action={<SectionActionLink to="/program">{programAllLabel}</SectionActionLink>}
      />
      <ProgramGrid>
        {events.map((event, index) => (
          <Grid key={event.id} size={{ xs: 12, md: 4 }}>
            <ProgramCard event={event} tint={resolveEventTint(theme, index)} />
          </Grid>
        ))}
      </ProgramGrid>
      <ProgramList>
        {events.map((event, index) => (
          <EventRow key={event.id} event={event} tint={resolveEventTint(theme, index)} />
        ))}
      </ProgramList>
    </KkSection>
  );
};
