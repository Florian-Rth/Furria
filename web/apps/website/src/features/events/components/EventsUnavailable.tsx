import { KkButton, KkErrorState, KkSection, PageLayout } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { ClubMailKkButton } from '@/components/ClubMailKkButton';
import { eventsSourceLabels } from '@/features/events/list-content';

interface EventsUnavailableProps {
  onRetry: () => void;
}

export const EventsUnavailable: FC<EventsUnavailableProps> = ({ onRetry }) => (
  <PageLayout>
    <PageLayout.Body>
      <KkSection>
        <KkErrorState
          title={eventsSourceLabels.errorTitle}
          description={eventsSourceLabels.errorText}
          action={
            <Stack
              direction="row"
              sx={{ gap: 2, flexWrap: 'wrap', justifyContent: 'center', pt: 1 }}
            >
              <KkButton onClick={onRetry}>{eventsSourceLabels.errorRetry}</KkButton>
              <ClubMailKkButton variant="outlined">{eventsSourceLabels.askCta}</ClubMailKkButton>
            </Stack>
          }
        />
      </KkSection>
    </PageLayout.Body>
  </PageLayout>
);
