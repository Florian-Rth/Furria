import { KkLead, KkSection } from '@furria/ui';
import type { FC } from 'react';
import { joinFaqIntro, joinFaqKicker, joinFaqTitle } from '@/features/membership/faq-content';
import { useJoinFaq } from '@/features/membership/hooks/use-join-faq';
import { JoinFaqList } from './internal/layout/JoinFaqList';
import { JoinFaqItem } from './internal/ui/JoinFaqItem';

export const JoinFaq: FC = () => {
  const entries = useJoinFaq();

  return (
    <KkSection>
      <KkSection.Header kicker={joinFaqKicker} title={joinFaqTitle} />
      <KkLead>{joinFaqIntro}</KkLead>
      <JoinFaqList>
        {entries.map((entry) => (
          <JoinFaqItem key={entry.id} entry={entry} />
        ))}
      </JoinFaqList>
    </KkSection>
  );
};
