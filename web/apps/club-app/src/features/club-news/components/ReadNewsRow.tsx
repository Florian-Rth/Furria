import { KkNewsRow } from '@furria/ui/KkNewsRow';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { longDateOf, readNewsCategoryOf, shortDateOf } from '../read-news';
import { articlePathOf } from '../read-news-paths';
import type { ReadNewsPost } from '../schemas';
import { ReadNewsPhoto } from './ReadNewsPhoto';

const ROW_PHOTO_SIZES = '5rem';

interface ReadNewsRowProps {
  post: ReadNewsPost;
}

export const ReadNewsRow: FC<ReadNewsRowProps> = ({ post }) => {
  const photo = <ReadNewsPhoto picture={post.picture} sizes={ROW_PHOTO_SIZES} />;
  const link = { component: Link, to: articlePathOf(post.slug) };
  const category = readNewsCategoryOf(post.category);
  const shortDate = shortDateOf(post.publishedAt);
  const longDate = longDateOf(post.publishedAt);

  return (
    <KkNewsRow
      title={post.title}
      teaser={post.teaser}
      category={category}
      shortDate={shortDate}
      longDate={longDate}
      photo={photo}
      link={link}
      fit="column"
    />
  );
};
