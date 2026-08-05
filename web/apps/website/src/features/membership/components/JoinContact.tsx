import { KkCard, KkSection } from '@furria/ui';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import {
  joinContactHref,
  joinContactKicker,
  joinContactLabel,
  joinContactNote,
  joinContactText,
  joinContactTitle,
} from '@/features/membership/contact-content';

export const JoinContact: FC = () => (
  <KkSection>
    <KkSection.Header kicker={joinContactKicker} title={joinContactTitle} />
    <KkCard sx={{ maxWidth: '44rem' }}>
      <KkCard.Body>
        <KkCard.Text>{joinContactText}</KkCard.Text>
        <Button
          href={joinContactHref}
          variant="contained"
          color="primary"
          size="large"
          sx={{ maxWidth: '100%', wordBreak: 'break-word' }}
        >
          {joinContactLabel}
        </Button>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          {joinContactNote}
        </Typography>
      </KkCard.Body>
    </KkCard>
  </KkSection>
);
