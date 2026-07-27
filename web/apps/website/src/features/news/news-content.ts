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

export const newsDescription =
  'Was bei uns passiert: Neues von der Bühne, aus dem Wagenbau und den Gruppen — dazu Termine, Erfolge und alles, was die Session sonst noch bringt.';

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
    slug: 'konfetti-kritische-masse',
    title: 'Konfettilager erreicht kritische Masse',
    category: 'Session',
    publishedAt: '2026-07-18',
    teaser:
      'Im Keller des Vereinsheims lagern 4,2 Tonnen Konfetti. Zwei Physiker raten dringend davon ab, dort das Licht anzuschalten.',
    body: [
      'Was 1998 als Restposten begann, ist außer Kontrolle geraten: Im Keller des Vereinsheims lagern nach aktueller Zählung **4,2 Tonnen Konfetti**. Der Stapel hat inzwischen eine eigene Statik und wirft einen Schatten.',
      'Zwei zufällig anwesende Physiker sprechen von einer „kritischen Masse“. Ab 4,5 Tonnen sei eine Kettenreaktion nicht mehr auszuschließen — jedes Schnipsel löse dann das nächste aus, bis das halbe Dorf bis zum ersten Stock gefüllt wäre.',
      'Der Elferrat hat sich in einer Sondersitzung für die einzige verantwortungsvolle Lösung entschieden: **alles auf einmal werfen**. Termin ist der 11.11., Ort ist überall.',
      'Wer einen Staubsauger besitzt, wird gebeten, ihn ab dem 12.11. bereitzuhalten.',
    ],
    image: 'konfetti-kritische-masse',
    author: 'Albert Einstein',
  },
  {
    slug: 'maennerballett-scala',
    title: 'Männerballett tanzt Schwanensee an der Mailänder Scala',
    category: 'Erfolge',
    publishedAt: '2026-07-12',
    teaser:
      'Eine verwechselte E-Mail, ein ausverkauftes Haus, drei Zugaben. Die Scala hat den Abend bis heute nicht dementiert.',
    body: [
      'Es begann mit einer verwechselten E-Mail und endete mit **drei Zugaben**: Das Männerballett hat an der Mailänder Scala Schwanensee getanzt. Eingeladen war eigentlich ein Ensemble aus Sankt Petersburg.',
      'Aufgefallen ist der Unterschied niemandem. Tschaikowski wurde vorsichtshalber in **Marschtakt** umgeschrieben, die Tutus saßen, und der zweite Akt kam ganz ohne Sprung über den Bühnenrand aus.',
      'Das Publikum stand nach elf Minuten. Die Scala hat den Auftritt seither weder bestätigt noch dementiert.',
      'Geprobt wird weiter mittwochs im Vereinsheim, zwischen Getränkekisten.',
    ],
    image: 'maennerballett-scala',
    author: null,
  },
  {
    slug: 'vereinsheim-zeitzone',
    title: 'Vereinsheim bekommt eigene Zeitzone',
    category: 'Verein',
    publishedAt: '2026-07-04',
    teaser:
      'Ab sofort gilt im Vereinsheim UTC+11:11. Alles passiert um 11:11 Uhr — auch das, was schon vorbei ist.',
    body: [
      'Der Vorstand hat beschlossen, was längst gelebte Praxis war: Im Vereinsheim gilt ab sofort die eigene Zeitzone **UTC+11:11**.',
      'Die Regel ist einfach. Alles beginnt um 11:11 Uhr. Auch Dinge, die um 20:00 Uhr beginnen, beginnen um 11:11 Uhr. Wer zu spät kommt, kommt pünktlich, denn es ist immer 11:11 Uhr.',
      'Ein Antrag auf Anerkennung ist gestellt. Die Deutsche Bahn hat mitgeteilt, dass sie ohnehin nach einem anderen System arbeitet.',
    ],
    image: null,
    author: null,
  },
  {
    slug: 'goethe-ehrenmitglied',
    title: 'Goethe wird Ehrenmitglied — 194 Jahre zu spät',
    category: 'Verein',
    publishedAt: '2026-06-26',
    teaser:
      'Im Aktenschrank lag ein Blatt, das niemand einordnen konnte. Der Vorstand hat es einstimmig als Mitgliedsantrag angenommen.',
    body: [
      'Beim Aufräumen des Aktenschranks tauchte ein Blatt auf, das niemand einordnen konnte. Der Vorstand hat es zur Sicherheit als Mitgliedsantrag gewertet und einstimmig angenommen: **Johann Wolfgang von Goethe** ist Ehrenmitglied.',
      'Dass er den Antrag nie gestellt hat, wurde in der Aussprache als „Formsache“ abgetan. Auch der Umstand, dass er **194 Jahre** zu spät kommt, gilt satzungsgemäß als entschuldigt.',
      'Der Beitrag wird ihm erlassen. Im Gegenzug wird „Faust“ ab dieser Session als Büttenrede aufgeführt — gekürzt auf elf Minuten, in Reimen und mit Tusch.',
      'Eine Anfrage in Weimar blieb unbeantwortet.',
    ],
    image: 'goethe-ehrenmitglied',
    author: null,
  },
  {
    slug: 'kamelle-weltrekord',
    title: 'Kamelle fliegt 1.400 Meter — Rekord nicht anerkannt',
    category: 'Erfolge',
    publishedAt: '2026-06-14',
    teaser:
      'Der Wurf landete im Nachbardorf, im Vorgarten eines völlig Unbeteiligten. Der Verband spricht von Rückenwind.',
    body: [
      'Beim Trainingswurf hinter der Bauhalle ist ein Wurf über **1.400 Meter** gelungen. Das Bonbon landete im Nachbardorf, im Vorgarten eines völlig Unbeteiligten, der es pflichtbewusst fotografierte.',
      'Der Verband erkennt den Rekord nicht an. Begründung: **Rückenwind**. Gemessen wurden 0,3 km/h.',
      'Ein zweiter Wurf vom selben Nachmittag ist bis heute nicht wieder aufgetaucht. Wer ihn findet, möge sich im Vereinsheim melden.',
    ],
    image: 'kamelle-weltrekord',
    author: null,
  },
  {
    slug: 'wagen-zu-hoch',
    title: 'Neuer Umzugswagen ist zu hoch für die Erdatmosphäre',
    category: 'Gruppen',
    publishedAt: '2026-05-30',
    teaser:
      'Der Wagen misst in der Spitze 11,11 Meter. Das Luftfahrtbundesamt hat einen Flugplan angefordert.',
    body: [
      'Der Wagen für den Rosenmontagszug ist fertig und misst in der Spitze **11,11 Meter**. Damit ist er nach Auskunft des Wagenbaus „vielleicht einen Meter zu hoch“.',
      'Das **Luftfahrtbundesamt** hat daraufhin einen Flugplan angefordert. Eingereicht wurde einer, in dem als Reiseflughöhe „Marktstraße“ und als Ziel „zurück“ angegeben ist.',
      'Bis zur Klärung wird der Wagen liegend gelagert. Das erfordert eine Halle von 11,11 Metern Länge, die ebenfalls noch nicht existiert.',
    ],
    image: null,
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
