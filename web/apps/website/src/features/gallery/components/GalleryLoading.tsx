import { KkLead, KkSection, PageLayout } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { gallerySourceLabels } from '@/features/gallery/gallery-content';

export const GalleryLoading: FC = () => (
  <PageLayout>
    <PageLayout.Body>
      <KkSection>
        <Stack role="status">
          <KkLead>{gallerySourceLabels.loading}</KkLead>
        </Stack>
      </KkSection>
    </PageLayout.Body>
  </PageLayout>
);
