import { KkInlineLink } from '@furria/ui/KkInlineLink';
import { KkMention } from '@furria/ui/KkMention';
import { KkMentionCard } from '@furria/ui/KkMentionCard';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { MENTION_CARD_LABELS } from '../rich-text-copy';
import type { MentionedPerson } from '../schemas';

const PERSON_FACE = { kind: 'person' } as const;
const MEMBER_ROUTE = '/members/$personId';

interface RichTextPersonMentionProps {
  label: string;
  person: MentionedPerson;
}

export const RichTextPersonMention: FC<RichTextPersonMentionProps> = ({ label, person }) => {
  const name = `${person.firstName} ${person.lastName}`;
  const initials = toInitials(person.firstName, person.lastName);
  const params = { personId: String(person.personId) };
  const action = (
    <KkInlineLink component={Link} to={MEMBER_ROUTE} params={params}>
      {MENTION_CARD_LABELS.personCta}
    </KkInlineLink>
  );

  return (
    <KkMention label={label} tone={null}>
      <KkMentionCard
        face={PERSON_FACE}
        name={name}
        line={person.officeName}
        initials={initials}
        picture={person.portrait}
        action={action}
      />
    </KkMention>
  );
};
