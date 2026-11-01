import { KkNewsLead } from '@furria/ui/KkNewsLead';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { longDateOf, readingTimeOf, readNewsCategoryOf } from '../read-news';
import { READ_MORE_LABEL } from '../read-news-copy';
import { articlePathOf } from '../read-news-paths';
import type { ReadNewsPost } from '../schemas';
import { ReadNewsPhoto } from './ReadNewsPhoto';

const LEAD_PHOTO_SIZES = '(min-width: 900px) 45rem, 100vw';

interface ReadNewsLeadProps {
  post: ReadNewsPost;
}

export const ReadNewsLead: FC<ReadNewsLeadProps> = ({ post }) => {
  const photo = <ReadNewsPhoto picture={post.picture} sizes={LEAD_PHOTO_SIZES} />;
  const link = { component: Link, to: articlePathOf(post.slug) };
  const category = readNewsCategoryOf(post.category);
  const date = longDateOf(post.publishedAt);
  const readingTime = readingTimeOf(post.text);

  return (
    <KkNewsLead
      title={post.title}
      teaser={post.teaser}
      category={category}
      date={date}
      photo={photo}
      readMoreLabel={READ_MORE_LABEL}
      readingTime={readingTime}
      link={link}
      fit="column"
    />
  );
};
