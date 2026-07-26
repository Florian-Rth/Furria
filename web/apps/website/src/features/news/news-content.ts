import type { Theme } from '@mui/material/styles';
import type { LinkProps } from '@tanstack/react-router';
import type { Session } from '@/lib/club';
import { sessionAt } from '@/lib/club';
import { formatLongDate } from '@/lib/date';

export type NewsCategory = 'Session' | 'Erfolge' | 'Verein' | 'Gruppen';

export interface NewsPost {
  slug: string;
  title: string;
  category: NewsCategory;
  publishedAt: string;
  teaser: string;
  body: string[];
  image: string | null;
  author: string | null;
}

export const newsHeading = 'AKTUELLES';

export const moreNewsLabel = 'WEITERE MELDUNGEN';

export const readMoreLabel = 'Ganze Meldung lesen →';

export const backToListLabel = '← Alle Meldungen';

export const allNewsLabel = 'Alle Meldungen →';

export const heroCaptionNote = 'Foto: Vereinsarchiv · Platzhalter';

export const shareLabel = 'TEILEN';

export const whatsAppShareLabel = 'WhatsApp';

export const copyLinkLabel = 'Link kopieren';

export const copiedLinkLabel = 'Link kopiert ✓';

export const newsEyebrow = 'AUS DEM VEREIN';

const sessionClosingSentence = 'Das war alles aus dieser Session.';

const archiveHintSentence = 'Ältere Meldungen liegen im Archiv.';

export const newsArchiveHref = '/news/archive';

export const buildPostHref = (slug: string): string => `/news/${slug}`;

export const newsEmptyNote = 'Noch keine Meldungen in dieser Session.';

export interface NewsProgramBandContent {
  kicker: string;
  headline: string;
  ctaLabel: string;
  ctaTo: LinkProps['to'];
}

export const newsProgramBandContent: NewsProgramBandContent = {
  kicker: 'NICHTS VERPASSEN',
  headline: 'ALLE TERMINE DER SESSION',
  ctaLabel: 'Zum Programm →',
  ctaTo: '/program',
};

export const NEWS_POSTS: NewsPost[] = [
  {
    slug: 'motto-56',
    title: 'Das Motto der 56. Session steht',
    category: 'Session',
    publishedAt: '2026-07-18',
    teaser:
      'Vier Monate hat der Elferrat gebrütet, jetzt ist es raus: „Groß Furria hebt ab“. Was das für Wagen, Kostüme und die Prunksitzungen bedeutet.',
    body: [
      'Es war ein langer Abend im Vereinsheim, mit viel Kaffee und noch mehr Widerspruch — aber am Ende stand es einstimmig: Die 56. Session steht unter dem Motto **„Groß Furria hebt ab“**. Luftfahrt, Raumfahrt, Höhenflüge aller Art: Alles ist erlaubt, was den Boden verlässt.',
      'Für den Wagenbau heißt das ab September Vollgas. Uwe hat schon angekündigt, dass er „irgendwas mit Rakete“ vorhat — Details verrät er nicht, aber wer Blech biegen kann, ist ab dem ersten Bautag herzlich willkommen.',
      'Die Garden richten ihre Choreografien am Motto aus, die Kostümgruppe trifft sich Ende August zum ersten Zuschnitt. Wer Stoff, Ideen oder eine Nähmaschine beisteuern kann: bitte bei Marlies melden.',
      'Und für alle, die einfach nur feiern wollen: Der Termin für die große Eröffnung steht ebenfalls. Am **11.11. um 19:11 Uhr** wecken wir die fünfte Jahreszeit — diesmal mit Startrampe.',
    ],
    image: 'motto-56-session',
    author: 'Franz-Josef Besen',
  },
  {
    slug: 'landestreffen',
    title: 'Tanzgarde tanzt auf Platz 2 beim Landestreffen',
    category: 'Erfolge',
    publishedAt: '2026-07-12',
    teaser:
      'Nur zwei Zehntel hinter dem Sieger — die beste Platzierung seit 2019. Und das mit zwei kurzfristigen Umbesetzungen.',
    body: [
      'Zwei Zehntel. So knapp war der Abstand zum Sieger beim Landestreffen — und so groß der Jubel, als die Wertung feststand: **Platz 2** für die Tanzgarde, die beste Platzierung seit 2019.',
      'Dass es überhaupt so weit kam, war nicht selbstverständlich. Zwei Tänzerinnen fielen kurzfristig aus, zwei andere sprangen ein und lernten die Choreografie in drei Proben. Angesehen hat man es der Kür nicht.',
      'Der Applaus in der Halle hielt lange an. Wer die Garde live sehen will: In der neuen Session steht sie in jeder Prunksitzung auf der Bühne.',
    ],
    image: 'landestreffen-tanzgarde',
    author: null,
  },
  {
    slug: 'wagenbau',
    title: 'Wir suchen Hände für den Wagenbau',
    category: 'Verein',
    publishedAt: '2026-07-04',
    teaser:
      'Ab September wird gebaut. Schweißen, schrauben, streichen, Kaffee kochen — jede Fähigkeit findet einen Platz in der Halle.',
    body: [
      'Ab **September** stehen die Türen der Bauhalle wieder offen. Aus Latten, Draht und sehr viel Pappmaché entsteht bis Februar der Wagen für den Rosenmontagsumzug — und dafür brauchen wir Hände.',
      'Schweißen, schrauben, streichen, Kaffee kochen: Vorkenntnisse sind keine Bedingung, gute Laune schon. Jede Fähigkeit findet einen Platz, und wer nur einen Abend Zeit hat, ist genauso willkommen wie wer jede Woche kommt.',
      'Wer mitbauen will, meldet sich bei Uwe oder kommt einfach am ersten Bautag vorbei.',
    ],
    image: null,
    author: null,
  },
  {
    slug: 'ballett-probe',
    title: 'Männerballett probt ab August wieder mittwochs',
    category: 'Gruppen',
    publishedAt: '2026-06-26',
    teaser:
      'Neue Zeit, gleicher Ernst: ab dem 5. August immer 20:00 Uhr im Vereinsheim. Zwei Plätze sind frei.',
    body: [
      'Das Männerballett probt ab dem **5. August** wieder mittwochs, immer **20:00 Uhr** im Vereinsheim. Die neue Zeit gilt für die ganze Session.',
      'Zwei Plätze in der Gruppe sind frei. Tanzerfahrung braucht niemand — Humor, Pünktlichkeit und die Bereitschaft, sich vor dem halben Dorf zum Narren zu machen, reichen völlig.',
    ],
    image: null,
    author: null,
  },
  {
    slug: 'jhv',
    title: 'Jahreshauptversammlung: Marlies bleibt Präsidentin',
    category: 'Verein',
    publishedAt: '2026-06-14',
    teaser:
      'Alle Ämter wurden für zwei weitere Jahre bestätigt, die Kasse einstimmig entlastet — und der Beitrag bleibt bei 30 Euro.',
    body: [
      'Die Jahreshauptversammlung im Vereinsheim war schneller vorbei als gedacht: **Marlies Furrmann** bleibt Präsidentin, alle weiteren Ämter wurden für zwei Jahre bestätigt.',
      'Die Kasse wurde einstimmig entlastet. Der **Beitrag bleibt bei 30 Euro** im Jahr, für Jugend- und Passiv-Mitgliedschaften gilt weiterhin der reduzierte Satz.',
      'Anschließend wurde noch lange über das Motto der neuen Session diskutiert. Ergebnis: keins. Das kam erst einen Monat später.',
    ],
    image: 'jahreshauptversammlung',
    author: null,
  },
  {
    slug: 'stadtfest',
    title: 'Kindergarde beim Stadtfest: 24 Kinder, ein Auftritt',
    category: 'Erfolge',
    publishedAt: '2026-05-30',
    teaser:
      'Der erste große Auftritt der Kleinsten in diesem Jahr — und ein Applaus, der die halbe Marktstraße füllte.',
    body: [
      '**24 Kinder** auf einer Bühne, die eigentlich für zwölf gebaut ist: Die Kindergarde hat beim Stadtfest ihren ersten großen Auftritt des Jahres hingelegt — und dabei keinen einzigen Schritt vergessen.',
      'Der Applaus füllte die halbe Marktstraße. Danach gab es Eis, und zwar für alle.',
      'Die nächsten Auftritte stehen in der Session an. Geprobt wird freitags in der Turnhalle.',
    ],
    image: 'kindergarde-stadtfest',
    author: null,
  },
];

export const sortPostsByDateDesc = (posts: NewsPost[]): NewsPost[] =>
  [...posts].sort((first, second) => second.publishedAt.localeCompare(first.publishedAt));

export const selectLeadPost = (posts: NewsPost[]): NewsPost | undefined =>
  sortPostsByDateDesc(posts)[0];

export const selectFollowingPosts = (posts: NewsPost[]): NewsPost[] =>
  sortPostsByDateDesc(posts).slice(1);

export const findPostBySlug = (posts: NewsPost[], slug: string): NewsPost | undefined =>
  posts.find((post) => post.slug === slug);

const RELATED_POSTS_LIMIT = 3;

export const selectRelatedPosts = (posts: NewsPost[], currentSlug: string): NewsPost[] =>
  sortPostsByDateDesc(posts)
    .filter((post) => post.slug !== currentSlug)
    .slice(0, RELATED_POSTS_LIMIT);

const TEASER_POSTS_LIMIT = 3;

export const selectTeaserPosts = (posts: NewsPost[]): NewsPost[] =>
  sortPostsByDateDesc(posts).slice(0, TEASER_POSTS_LIMIT);

export const resolveCategoryTint = (theme: Theme, category: NewsCategory): string => {
  const palette = (theme.vars ?? theme).palette;
  if (category === 'Session') {
    return palette.primary.main;
  }
  if (category === 'Erfolge') {
    return palette.warning.main;
  }
  return palette.text.primary;
};

export const resolveCategoryContrastText = (theme: Theme, category: NewsCategory): string => {
  const palette = (theme.vars ?? theme).palette;
  if (category === 'Session') {
    return palette.primary.contrastText;
  }
  if (category === 'Erfolge') {
    return palette.warning.contrastText;
  }
  return palette.background.default;
};

export const resolveArchiveSession = (posts: NewsPost[], reference: Date): Session | null => {
  const openSession = sessionAt(reference);
  const olderSessions = posts
    .map((post) => sessionAt(new Date(post.publishedAt)))
    .filter((session) => session.startYear < openSession.startYear);

  if (olderSessions.length === 0) {
    return null;
  }

  return olderSessions.reduce((newest, session) =>
    session.startYear > newest.startYear ? session : newest,
  );
};

export const buildArchiveLabel = (session: Session): string => `Archiv ${session.yearsLabel}`;

export const buildNewsListFooterNote = (archiveSession: Session | null): string =>
  archiveSession === null
    ? sessionClosingSentence
    : `${sessionClosingSentence} ${archiveHintSentence}`;

const WORDS_PER_MINUTE = 180;

const READING_TIME_MINIMUM_MINUTES = 3;

export const deriveReadingTime = (body: string[]): string | null => {
  const wordCount = body
    .join(' ')
    .split(/\s+/)
    .filter((word) => word !== '').length;
  const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE);

  if (minutes < READING_TIME_MINIMUM_MINUTES) {
    return null;
  }

  return `${minutes} Min. Lesezeit`;
};

export const buildPostByline = (post: NewsPost): string =>
  post.author === null
    ? formatLongDate(post.publishedAt)
    : `${formatLongDate(post.publishedAt)} · von ${post.author}`;

export interface InlineSegment {
  text: string;
  bold: boolean;
}

const BOLD_MARKER = '**';

export const parseInlineBold = (paragraph: string): InlineSegment[] => {
  const parts = paragraph.split(BOLD_MARKER);
  const hasUnmatchedMarker = parts.length % 2 === 0;

  return parts.flatMap((part, index) => {
    const isTrailingRemainder = hasUnmatchedMarker && index === parts.length - 1;
    const text = isTrailingRemainder ? `${BOLD_MARKER}${part}` : part;
    if (text === '') {
      return [];
    }
    return [{ text, bold: index % 2 === 1 && !isTrailingRemainder }];
  });
};

const WHATSAPP_SHARE_BASE = 'https://wa.me/?text=';

export const buildWhatsAppShareUrl = (title: string, url: string): string =>
  `${WHATSAPP_SHARE_BASE}${encodeURIComponent(`${title}\n${url}`)}`;
