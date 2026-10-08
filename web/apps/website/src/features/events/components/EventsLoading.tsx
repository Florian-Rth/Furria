import { KkLead, KkSection, PageLayout } from '@furria/ui';
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
