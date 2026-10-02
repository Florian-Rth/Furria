import { KkCard, KkSection } from '@furria/ui';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { ClubMailButton } from '@/components/ClubMailButton';
import {
  joinContactKicker,
  joinContactText,
  joinContactTitle,
} from '@/features/membership/contact-content';
import { useJoinContactNote } from '@/features/membership/hooks/use-join-contact-note';

export const JoinContact: FC = () => {
  const joinContactNote = useJoinContactNote();

  return (
    <KkSection>
      <KkSection.Header kicker={joinContactKicker} title={joinContactTitle} />
      <KkCard sx={{ maxWidth: '44rem' }}>
        <KkCard.Body>
          <KkCard.Text>{joinContactText}</KkCard.Text>
          <ClubMailButton
            variant="contained"
            color="primary"
            size="large"
            sx={{ maxWidth: '100%', wordBreak: 'break-word' }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {joinContactNote}
          </Typography>
        </KkCard.Body>
      </KkCard>
    </KkSection>
  );
};
