import { KkLead, KkSection } from '@furria/ui';
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
    <KkLead>{joinFaqIntro}</KkLead>
    <JoinFaqList>
      {JOIN_FAQ.map((entry) => (
        <JoinFaqItem key={entry.id} entry={entry} />
      ))}
    </JoinFaqList>
  </KkSection>
);
