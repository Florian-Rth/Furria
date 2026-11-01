import { KkInlineLink } from '@furria/ui/KkInlineLink';
import { KkNewsMention } from '@furria/ui/KkNewsMention';
import { KkNewsMentionCard } from '@furria/ui/KkNewsMentionCard';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { groupInitialsOf } from '../read-news';
import { MENTION_LABELS } from '../read-news-copy';
import type { ReadNewsGroup } from '../schemas';

const GROUP_ROUTE = '/groups/$groupId';

interface ReadNewsGroupMentionProps {
  label: string;
  group: ReadNewsGroup;
}

export const ReadNewsGroupMention: FC<ReadNewsGroupMentionProps> = ({ label, group }) => {
  const face = { kind: 'group', tone: group.tone } as const;
  const initials = groupInitialsOf(group.name);
  const params = { groupId: String(group.groupId) };
  const action = (
    <KkInlineLink component={Link} to={GROUP_ROUTE} params={params}>
      {MENTION_LABELS.groupCta}
    </KkInlineLink>
  );

  return (
    <KkNewsMention label={label} tone={group.tone}>
      <KkNewsMentionCard
        face={face}
        name={group.name}
        line={group.description}
        initials={initials}
        picture={group.picture}
        action={action}
      />
    </KkNewsMention>
  );
};
