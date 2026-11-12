import { KkInlineLink } from '@furria/ui/KkInlineLink';
import { KkMention } from '@furria/ui/KkMention';
import { KkMentionCard } from '@furria/ui/KkMentionCard';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { groupInitialsOf } from '@/lib/initials';
import { MENTION_CARD_LABELS } from '../rich-text-copy';
import type { MentionedGroup } from '../schemas';

const GROUP_ROUTE = '/groups/$groupId';

interface RichTextGroupMentionProps {
  label: string;
  group: MentionedGroup;
}

export const RichTextGroupMention: FC<RichTextGroupMentionProps> = ({ label, group }) => {
  const face = { kind: 'group', tone: group.tone } as const;
  const initials = groupInitialsOf(group.name);
  const params = { groupId: String(group.groupId) };
  const action = (
    <KkInlineLink component={Link} to={GROUP_ROUTE} params={params}>
      {MENTION_CARD_LABELS.groupCta}
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
