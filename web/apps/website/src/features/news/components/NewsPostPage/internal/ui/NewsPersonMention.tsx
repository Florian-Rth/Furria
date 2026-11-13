import { KkMention } from '@furria/ui/KkMention';
import { KkMentionCard } from '@furria/ui/KkMentionCard';
import type { FC } from 'react';
import { personInitialsOf, personNameOf } from '@/features/news/news-mentions';
import type { NewsMentionedPerson } from '@/lib/public-news/schemas';

const PERSON_FACE = { kind: 'person' } as const;

interface NewsPersonMentionProps {
  label: string;
  person: NewsMentionedPerson;
}

export const NewsPersonMention: FC<NewsPersonMentionProps> = ({ label, person }) => {
  const name = personNameOf(person);
  const initials = personInitialsOf(person);

  return (
    <KkMention label={label} tone={null}>
      <KkMentionCard
        face={PERSON_FACE}
        name={name}
        line={person.officeName}
        initials={initials}
        picture={person.portrait}
      />
    </KkMention>
  );
};
