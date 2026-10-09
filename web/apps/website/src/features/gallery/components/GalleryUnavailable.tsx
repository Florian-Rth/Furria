import { KkButton, KkErrorState, KkSection, PageLayout } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { ClubMailKkButton } from '@/components/ClubMailKkButton';
import { gallerySourceLabels } from '@/features/gallery/gallery-content';

interface GalleryUnavailableProps {
  onRetry: () => void;
}

export const GalleryUnavailable: FC<GalleryUnavailableProps> = ({ onRetry }) => (
  <PageLayout>
    <PageLayout.Body>
      <KkSection>
        <KkErrorState
          title={gallerySourceLabels.errorTitle}
          description={gallerySourceLabels.errorText}
          action={
            <Stack
              direction="row"
              sx={{ gap: 2, flexWrap: 'wrap', justifyContent: 'center', pt: 1 }}
            >
              <KkButton onClick={onRetry}>{gallerySourceLabels.errorRetry}</KkButton>
              <ClubMailKkButton variant="outlined">{gallerySourceLabels.askCta}</ClubMailKkButton>
            </Stack>
          }
        />
      </KkSection>
    </PageLayout.Body>
  </PageLayout>
);
