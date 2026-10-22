import { KkLead } from '@furria/ui/KkLead';
import { KkSection } from '@furria/ui/KkSection';
import { PageLayout } from '@furria/ui/PageLayout';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { eventsSourceLabels } from '@/features/events/list-content';

export const EventsLoading: FC = () => (
  <PageLayout>
    <PageLayout.Body>
      <KkSection>
        <Stack role="status">
          <KkLead>{eventsSourceLabels.loading}</KkLead>
        </Stack>
      </KkSection>
    </PageLayout.Body>
  </PageLayout>
);
