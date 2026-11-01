import { KkInlineLink } from '@furria/ui/KkInlineLink';
import { KkNewsMention } from '@furria/ui/KkNewsMention';
import { KkNewsMentionCard } from '@furria/ui/KkNewsMentionCard';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { MENTION_LABELS } from '../read-news-copy';
import type { ReadNewsPerson } from '../schemas';

const PERSON_FACE = { kind: 'person' } as const;
const MEMBER_ROUTE = '/members/$personId';

interface ReadNewsPersonMentionProps {
  label: string;
  person: ReadNewsPerson;
}

export const ReadNewsPersonMention: FC<ReadNewsPersonMentionProps> = ({ label, person }) => {
  const name = `${person.firstName} ${person.lastName}`;
  const initials = toInitials(person.firstName, person.lastName);
  const params = { personId: String(person.personId) };
  const action = (
    <KkInlineLink component={Link} to={MEMBER_ROUTE} params={params}>
      {MENTION_LABELS.personCta}
    </KkInlineLink>
  );

  return (
    <KkNewsMention label={label} tone={null}>
      <KkNewsMentionCard
        face={PERSON_FACE}
        name={name}
        line={person.officeName}
        initials={initials}
        picture={person.portrait}
        action={action}
      />
    </KkNewsMention>
  );
};
