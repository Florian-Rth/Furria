import { KkInlineLink } from '@furria/ui/KkInlineLink';
import { KkMention } from '@furria/ui/KkMention';
import { KkMentionCard } from '@furria/ui/KkMentionCard';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { newsMentionLabels } from '@/features/news/news-content';
import { GROUP_PAGE, groupInitialsOf, groupSearchOf } from '@/features/news/news-mentions';
import type { NewsMentionedGroup } from '@/lib/public-news/schemas';

interface NewsGroupMentionProps {
  label: string;
  group: NewsMentionedGroup;
}

export const NewsGroupMention: FC<NewsGroupMentionProps> = ({ label, group }) => {
  const face = { kind: 'group', tone: group.tone } as const;
  const initials = groupInitialsOf(group.name);
  const search = groupSearchOf(group.groupId);
  const action = (
    <KkInlineLink component={Link} to={GROUP_PAGE} search={search}>
      {newsMentionLabels.groupCta}
    </KkInlineLink>
  );

  return (
    <KkMention label={label} tone={group.tone}>
      <KkMentionCard
        face={face}
        name={group.name}
        line={group.description}
        initials={initials}
        picture={group.picture}
        action={action}
      />
    </KkMention>
  );
};
