import type { KkNewsCategory, KkNewsTone } from '@furria/ui';
import { newsReadingMinutesOf } from '@furria/ui/news-text';
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
  text: string;
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

export const newTabNote = 'öffnet in neuem Tab';

export const copiedLinkLabel = 'Link kopiert ✓';

export const newsEyebrow = 'AUS DEM VEREIN';

const sessionClosingSentence = 'Das war alles aus dieser Session.';

const archiveHintSentence = 'Ältere Meldungen liegen im Archiv.';

export const newsArchiveHref = '/news/archive';

export const buildPostHref = (slug: string): string => `/news/${slug}`;

export const newsEmptyNote = 'Noch keine Meldungen in dieser Session.';

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

export const NEWS_POSTS: NewsPost[] = [
  {
    slug: 'konfetti-kritische-masse',
    title: 'Konfettilager erreicht kritische Masse',
    category: 'Session',
    publishedAt: '2026-07-18',
    teaser:
      'Im Keller des Vereinsheims lagern 4,2 Tonnen Konfetti. Zwei Physiker raten dringend davon ab, dort das Licht anzuschalten.',
    text: 'Was 1998 als Restposten begann, ist außer Kontrolle geraten: Im Keller des Vereinsheims lagern nach aktueller Zählung **4,2 Tonnen Konfetti**. Der Stapel hat inzwischen eine eigene Statik und wirft einen Schatten.\n\nZwei zufällig anwesende Physiker sprechen von einer „kritischen Masse“. Ab 4,5 Tonnen sei eine Kettenreaktion nicht mehr auszuschließen — jedes Schnipsel löse dann das nächste aus, bis das halbe Dorf bis zum ersten Stock gefüllt wäre.\n\nDer Elferrat hat sich in einer Sondersitzung für die einzige verantwortungsvolle Lösung entschieden: **alles auf einmal werfen**. Termin ist der 11.11., Ort ist überall.\n\nWer einen Staubsauger besitzt, wird gebeten, ihn ab dem 12.11. bereitzuhalten.\n\n## Was jetzt passiert\n\n- Termin: 11.11., Ort: überall\n- Mitbringen: ein Schirm und **gute Laune**\n\nDie Physiker haben ihre Rechnung [beim Deutschen Museum](https://www.deutsches-museum.de) hinterlegt. Die Aufsicht übernimmt der @[Elferrat](group:1).',
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
    text: 'Es begann mit einer verwechselten E-Mail und endete mit **drei Zugaben**: Das Männerballett hat an der Mailänder Scala Schwanensee getanzt. Eingeladen war eigentlich ein Ensemble aus Sankt Petersburg.\n\nAufgefallen ist der Unterschied niemandem. Tschaikowski wurde vorsichtshalber in **Marschtakt** umgeschrieben, die Tutus saßen, und der zweite Akt kam ganz ohne Sprung über den Bühnenrand aus.\n\nDas Publikum stand nach elf Minuten. Die Scala hat den Auftritt seither weder bestätigt noch dementiert.\n\nGeprobt wird weiter mittwochs im Vereinsheim, zwischen Getränkekisten.',
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
    text: 'Der Vorstand hat beschlossen, was längst gelebte Praxis war: Im Vereinsheim gilt ab sofort die eigene Zeitzone **UTC+11:11**.\n\nDie Regel ist einfach. Alles beginnt um 11:11 Uhr. Auch Dinge, die um 20:00 Uhr beginnen, beginnen um 11:11 Uhr. Wer zu spät kommt, kommt pünktlich, denn es ist immer 11:11 Uhr.\n\nEin Antrag auf Anerkennung ist gestellt. Die Deutsche Bahn hat mitgeteilt, dass sie ohnehin nach einem anderen System arbeitet.',
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
    text: 'Beim Aufräumen des Aktenschranks tauchte ein Blatt auf, das niemand einordnen konnte. Der Vorstand hat es zur Sicherheit als Mitgliedsantrag gewertet und einstimmig angenommen: **Johann Wolfgang von Goethe** ist Ehrenmitglied.\n\nDass er den Antrag nie gestellt hat, wurde in der Aussprache als „Formsache“ abgetan. Auch der Umstand, dass er **194 Jahre** zu spät kommt, gilt satzungsgemäß als entschuldigt.\n\nDer Beitrag wird ihm erlassen. Im Gegenzug wird „Faust“ ab dieser Session als Büttenrede aufgeführt — gekürzt auf elf Minuten, in Reimen und mit Tusch.\n\nEine Anfrage in Weimar blieb unbeantwortet.',
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
    text: 'Beim Trainingswurf hinter der Bauhalle ist ein Wurf über **1.400 Meter** gelungen. Das Bonbon landete im Nachbardorf, im Vorgarten eines völlig Unbeteiligten, der es pflichtbewusst fotografierte.\n\nDer Verband erkennt den Rekord nicht an. Begründung: **Rückenwind**. Gemessen wurden 0,3 km/h.\n\nEin zweiter Wurf vom selben Nachmittag ist bis heute nicht wieder aufgetaucht. Wer ihn findet, möge sich im Vereinsheim melden.',
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
    text: 'Der Wagen für den Rosenmontagszug ist fertig und misst in der Spitze **11,11 Meter**. Damit ist er nach Auskunft des Wagenbaus „vielleicht einen Meter zu hoch“.\n\nDas **Luftfahrtbundesamt** hat daraufhin einen Flugplan angefordert. Eingereicht wurde einer, in dem als Reiseflughöhe „Marktstraße“ und als Ziel „zurück“ angegeben ist.\n\nBis zur Klärung wird der Wagen liegend gelagert. Das erfordert eine Halle von 11,11 Metern Länge, die ebenfalls noch nicht existiert.',
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

export const categoryToneOf = (category: NewsCategory): KkNewsTone => {
  if (category === 'Session') {
    return 'red';
  }
  if (category === 'Erfolge') {
    return 'gold';
  }
  return 'ink';
};

export const newsCategoryOf = (category: NewsCategory): KkNewsCategory => ({
  label: category,
  tone: categoryToneOf(category),
});

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

export const deriveReadingTime = (text: string): string | null => {
  const minutes = newsReadingMinutesOf(text);

  return minutes === null ? null : `${minutes} Min. Lesezeit`;
};

export const buildPostByline = (post: NewsPost): string =>
  post.author === null
    ? formatLongDate(post.publishedAt)
    : `${formatLongDate(post.publishedAt)} · von ${post.author}`;

const WHATSAPP_SHARE_BASE = 'https://wa.me/?text=';

export const buildWhatsAppShareUrl = (title: string, url: string): string =>
  `${WHATSAPP_SHARE_BASE}${encodeURIComponent(`${title}\n${url}`)}`;
