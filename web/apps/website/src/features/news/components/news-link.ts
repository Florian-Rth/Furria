import type { KkNewsLink } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import { buildPostHref } from '@/features/news/news-content';

export const newsLinkOf = (slug: string): KkNewsLink => ({
  component: Link,
  to: buildPostHref(slug),
});
