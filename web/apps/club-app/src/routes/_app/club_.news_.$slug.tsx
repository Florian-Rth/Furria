import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { ReadNewsArticleScreen } from '@/features/club-news/components/ReadNewsArticleScreen';

const ReadNewsArticleRoute: FC = () => {
  const { slug } = Route.useParams();

  return <ReadNewsArticleScreen slug={slug} />;
};

export const Route = createFileRoute('/_app/club_/news_/$slug')({
  component: ReadNewsArticleRoute,
});
