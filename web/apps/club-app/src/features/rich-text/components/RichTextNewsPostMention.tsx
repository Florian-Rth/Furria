import { KkInlineLink } from '@furria/ui/KkInlineLink';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { newsPostMentionLineOf } from '../mention-lines';
import { MENTION_CARD_LABELS } from '../rich-text-copy';
import type { MentionedNewsPost } from '../schemas';
import { RichTextItemMention } from './RichTextItemMention';

const NEWS_POST_ROUTE = '/club/news/$slug';

interface RichTextNewsPostMentionProps {
  label: string;
  post: MentionedNewsPost;
}

export const RichTextNewsPostMention: FC<RichTextNewsPostMentionProps> = ({ label, post }) => {
  const line = newsPostMentionLineOf(post.publishedAt);
  const params = { slug: post.slug };
  const action = (
    <KkInlineLink component={Link} to={NEWS_POST_ROUTE} params={params}>
      {MENTION_CARD_LABELS.newsPostCta}
    </KkInlineLink>
  );

  return <RichTextItemMention label={label} name={post.title} line={line} action={action} />;
};
