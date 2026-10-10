import { KkButton, KkErrorState, KkSection, PageLayout } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { ClubMailKkButton } from '@/components/ClubMailKkButton';
import { newsSourceLabels } from '@/features/news/news-content';

interface NewsUnavailableProps {
  onRetry: () => void;
}

export const NewsUnavailable: FC<NewsUnavailableProps> = ({ onRetry }) => (
  <PageLayout>
    <PageLayout.Body>
      <KkSection>
        <KkErrorState
          title={newsSourceLabels.errorTitle}
          description={newsSourceLabels.errorText}
          action={
            <Stack
              direction="row"
              sx={{ gap: 2, flexWrap: 'wrap', justifyContent: 'center', pt: 1 }}
            >
              <KkButton onClick={onRetry}>{newsSourceLabels.errorRetry}</KkButton>
              <ClubMailKkButton variant="outlined">{newsSourceLabels.askCta}</ClubMailKkButton>
            </Stack>
          }
        />
      </KkSection>
    </PageLayout.Body>
  </PageLayout>
);
