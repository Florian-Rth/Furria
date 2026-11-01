import type { KkImageSource } from '@furria/ui/image-source';
import { toImageSource } from '@furria/ui/image-source';
import type { KkStartTileReach } from '@furria/ui/reach';
import { Link } from '@tanstack/react-router';
import { ALL_NEWS_LABEL } from '@/features/club-news/read-news-copy';
import { READ_NEWS_ARTICLE_ROUTE, READ_NEWS_PATH } from '@/features/club-news/read-news-paths';
import { CATEGORY_LABELS } from '@/features/news/news-copy';
import type { PublishedDay } from '../news-tile';
import { publishedDayOf } from '../news-tile';
import type { StartPanelOf } from '../start-board';

export interface NewsTilePost {
  title: string;
  meta: string;
  image: KkImageSource | null;
  reach: KkStartTileReach;
}

export interface NewsTileView {
  reach: KkStartTileReach;
  post: NewsTilePost | null;
}

const THUMB_SIZES = '160px';
const META_SEPARATOR = ' · ';
const DAY_WORDS = { today: 'heute', yesterday: 'gestern' } as const;

const dayLabelOf = (day: PublishedDay): string =>
  day.kind === 'date' ? day.date : DAY_WORDS[day.kind];

export const useNewsTile = (panel: StartPanelOf<'news'>, now: Date): NewsTileView => {
  const [newest] = panel.news;

  return {
    reach: { label: ALL_NEWS_LABEL, component: Link, to: READ_NEWS_PATH },
    post:
      newest === undefined
        ? null
        : {
            title: newest.title,
            meta: [
              CATEGORY_LABELS[newest.category],
              dayLabelOf(publishedDayOf(newest.publishedAt, now)),
            ].join(META_SEPARATOR),
            image: toImageSource(newest.picture, 'banner', THUMB_SIZES),
            reach: {
              label: `${newest.title} lesen`,
              component: Link,
              to: READ_NEWS_ARTICLE_ROUTE,
              params: { slug: newest.slug },
            },
          },
  };
};
