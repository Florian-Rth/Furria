import { KkSection } from '@furria/ui';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import {
  JOIN_FAQ,
  joinFaqIntro,
  joinFaqKicker,
  joinFaqTitle,
} from '@/features/membership/faq-content';
import { JoinFaqList } from './internal/layout/JoinFaqList';
import { JoinFaqItem } from './internal/ui/JoinFaqItem';

export const JoinFaq: FC = () => (
  <KkSection>
    <KkSection.Header kicker={joinFaqKicker} title={joinFaqTitle} />
    <Typography
      variant="body1"
      sx={{ color: 'text.secondary', fontWeight: 500, maxWidth: '48rem' }}
    >
      {joinFaqIntro}
    </Typography>
    <JoinFaqList>
      {JOIN_FAQ.map((entry) => (
        <JoinFaqItem key={entry.id} entry={entry} />
      ))}
    </JoinFaqList>
  </KkSection>
);
