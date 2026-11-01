import { KkButton } from '@furria/ui/KkButton';
import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { ARTICLE_GONE_BACK, ARTICLE_GONE_DESCRIPTION, ARTICLE_GONE_TITLE } from '../read-news-copy';
import { READ_NEWS_PATH } from '../read-news-paths';

export const ReadNewsGone: FC = () => {
  const back = (
    <KkButton variant="outlined" component={Link} to={READ_NEWS_PATH}>
      {ARTICLE_GONE_BACK}
    </KkButton>
  );

  return (
    <KkEmptyState title={ARTICLE_GONE_TITLE} description={ARTICLE_GONE_DESCRIPTION} action={back} />
  );
};
