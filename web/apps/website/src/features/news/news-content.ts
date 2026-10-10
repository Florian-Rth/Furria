import type { KkNewsCategory, KkNewsStripPhoto, KkNewsTone } from '@furria/ui';
import { newsReadingMinutesOf } from '@furria/ui/news-text';
import type { LinkProps } from '@tanstack/react-router';
import { formatClockTime, formatLongDate, formatWeekdayAndFullDate } from '@/lib/date';
import type {
  NewsAlbum,
  NewsArticle,
  NewsCategory,
  NewsEvent,
  NewsPost,
  NewsSection,
  NewsSession,
} from '@/lib/public-news/schemas';

export const newsHeading = 'AKTUELLES';

export const newsDescription =
  'Was bei uns passiert: Neues von der Bühne, aus dem Wagenbau und den Gruppen — dazu Termine, Erfolge und alles, was die Session sonst noch bringt.';

export const moreNewsLabel = 'WEITERE MELDUNGEN';

export const readMoreLabel = 'Ganze Meldung lesen →';

export const backToListLabel = '← Alle Meldungen';

export const allNewsLabel = 'Alle Meldungen →';

export const shareLabel = 'TEILEN';

export const whatsAppShareLabel = 'WhatsApp';

export const copyLinkLabel = 'Link kopieren';

export const newTabNote = 'öffnet in neuem Tab';

export const copiedLinkLabel = 'Link kopiert ✓';

export const newsEyebrow = 'AUS DEM VEREIN';

export const newsEmptyNote = 'Noch keine Meldungen.';

export const newsSourceLabels = {
  loading: 'Die Meldungen kommen gleich.',
  errorTitle: 'DIE MELDUNGEN KOMMEN NICHT DURCH.',
  errorText:
    'Das liegt an uns, nicht an dir. Versuch es gleich noch einmal — oder schreib uns, dann antwortet ein Mensch.',
  errorRetry: 'Nochmal versuchen',
  askCta: 'Schreib uns',
} as const;

export const newsTiesLabels = {
  event: 'ZUR VERANSTALTUNG',
  eventCta: 'Zur Veranstaltung →',
  cancelled: 'Abgesagt',
  album: 'BILDER DAZU',
  albumCta: 'Zum Album →',
} as const;

export const newsMentionLabels = {
  groupCta: 'Zur Gruppe →',
  close: 'Schließen',
} as const;

export interface NewsEventsBandContent {
  kicker: string;
  headline: string;
  ctaLabel: string;
  ctaTo: LinkProps['to'];
}

export const newsEventsBandContent: NewsEventsBandContent = {
  kicker: 'NICHTS VERPASSEN',
  headline: 'ALLE TERMINE DER SESSION',
  ctaLabel: 'Zu den Veranstaltungen →',
  ctaTo: '/events',
};

export const buildPostHref = (slug: string): string => `/news/${slug}`;

const CATEGORY_LABELS: Record<NewsCategory, string> = {
  session: 'Session',
  achievements: 'Erfolge',
  club: 'Verein',
  groups: 'Gruppen',
};

const CATEGORY_TONES: Record<NewsCategory, KkNewsTone> = {
  session: 'red',
  achievements: 'gold',
  club: 'ink',
  groups: 'ink',
};

export const categoryLabelOf = (category: NewsCategory): string => CATEGORY_LABELS[category];

export const categoryToneOf = (category: NewsCategory): KkNewsTone => CATEGORY_TONES[category];

export const newsCategoryOf = (category: NewsCategory): KkNewsCategory => ({
  label: categoryLabelOf(category),
  tone: categoryToneOf(category),
});

export interface NewsFront {
  lead: NewsPost;
  following: NewsPost[];
  olderSections: NewsSection[];
}

export const arrangeNewsFront = (sections: NewsSection[]): NewsFront | null => {
  const [newest, ...olderSections] = sections;
  const [lead, ...following] = newest?.posts ?? [];

  return lead === undefined ? null : { lead, following, olderSections };
};

const postsOf = (sections: NewsSection[]): NewsPost[] => sections.flatMap(({ posts }) => posts);

const RELATED_POSTS_LIMIT = 3;

export const selectRelatedPosts = (sections: NewsSection[], currentSlug: string): NewsPost[] =>
  postsOf(sections)
    .filter((post) => post.slug !== currentSlug)
    .slice(0, RELATED_POSTS_LIMIT);

const TEASER_POSTS_LIMIT = 3;

export const selectTeaserPosts = (sections: NewsSection[]): NewsPost[] =>
  postsOf(sections).slice(0, TEASER_POSTS_LIMIT);

export const buildSessionLabel = (session: NewsSession): string =>
  session.number === null
    ? `SESSION ${session.yearsLabel}`
    : `${session.number}. SESSION ${session.yearsLabel}`;

export const deriveReadingTime = (text: string): string | null => {
  const minutes = newsReadingMinutesOf(text);

  return minutes === null ? null : `${minutes} Min. Lesezeit`;
};

export const buildPostByline = (article: NewsArticle): string =>
  article.author === null
    ? formatLongDate(article.publishedAt)
    : `${formatLongDate(article.publishedAt)} · von ${article.author.firstName} ${article.author.lastName}`;

export const buildEventTieLine = (event: NewsEvent): string =>
  [
    formatWeekdayAndFullDate(event.startsAt),
    `${formatClockTime(event.startsAt)} Uhr`,
    event.venueName,
    event.isCancelled ? newsTiesLabels.cancelled : null,
  ]
    .filter((fact) => fact !== null)
    .join(' · ');

export const buildPhotoCountLabel = (count: number): string =>
  count === 1 ? '1 Foto' : `${count} Fotos`;

const WHATSAPP_SHARE_BASE = 'https://wa.me/?text=';

export const buildWhatsAppShareUrl = (title: string, url: string): string =>
  `${WHATSAPP_SHARE_BASE}${encodeURIComponent(`${title}\n${url}`)}`;

export const albumStripOf = (album: NewsAlbum): KkNewsStripPhoto[] =>
  album.photos.map((photo) => ({ id: photo.mediaItemId, picture: photo, aspect: photo.aspect }));
