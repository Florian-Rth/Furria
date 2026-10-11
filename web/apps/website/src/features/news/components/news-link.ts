import type { KkNewsLink } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { PostAddress } from '@/features/news/news-content';
import { buildPostHref } from '@/features/news/news-content';

export const newsLinkOf = (post: PostAddress): KkNewsLink => ({
  component: Link,
  to: buildPostHref(post),
});
