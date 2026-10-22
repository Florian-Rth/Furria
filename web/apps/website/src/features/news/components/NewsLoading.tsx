import { KkLead } from '@furria/ui/KkLead';
import { KkSection } from '@furria/ui/KkSection';
import { PageLayout } from '@furria/ui/PageLayout';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { newsSourceLabels } from '@/features/news/news-content';

export const NewsLoading: FC = () => (
  <PageLayout>
    <PageLayout.Body>
      <KkSection>
        <Stack role="status">
          <KkLead>{newsSourceLabels.loading}</KkLead>
        </Stack>
      </KkSection>
    </PageLayout.Body>
  </PageLayout>
);
