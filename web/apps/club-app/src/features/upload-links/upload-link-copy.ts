import type { Remaining } from './upload-link-view';

export const LINKS_TITLE = 'Sammellinks';
export const LINKS_PATH = '/gallery/links';
export const OPEN_SECTION = 'Offen';
export const ENDED_SECTION = 'Abgelaufen und beendet';
export const EMPTY_LINKS = 'Noch kein Sammellink.';
export const LINKS_ERROR = 'Die Sammellinks ließen sich nicht laden.';
export const RETRY_LABEL = 'Erneut laden';
export const TITLE_FIELD = 'Anlass';
export const TITLE_HINT = 'z. B. Rosenmontagszug 2027';
export const CREATE_LABEL = 'Link erstellen';
export const CREATED_NOTICE = 'Sammellink erstellt – jetzt in die Gruppe teilen.';
export const REVOKED_NOTICE = 'Sammellink beendet.';
export const COPIED_NOTICE = 'Link kopiert.';
export const COPY_FAILED_NOTICE = 'Der Link ließ sich nicht kopieren.';
export const SHARE_LABEL = 'Teilen';
export const COPY_LABEL = 'Link kopieren';
export const REVOKE_LABEL = 'Beenden';
export const OPEN_ROW_LABEL = 'Sammellink öffnen';
export const SHEET_ID = 'upload-link-sheet';
export const SHEET_CLOSE = 'Schließen';
export const REVOKE_EYEBROW = 'Sammellink';
export const REVOKE_QUESTION = 'Sammellink jetzt beenden?';
export const REVOKE_EXPLANATION =
  'Laufende Uploads brechen ab. Was schon angekommen ist, bleibt im Eingang.';
export const REVOKE_CONFIRM = 'Beenden';
export const CANCEL_LABEL = 'Abbrechen';
export const OCCASION_FACT = 'Anlass';
export const UPLOADED_FACT = 'Hochgeladen';
export const SHARE_TEXT_PREFIX = 'Fotos und Videos hochladen:';

const countOf = (count: number, one: string, many: string): string =>
  `${count.toLocaleString('de-DE')} ${count === 1 ? one : many}`;

export const factLineOf = (uploadCount: number, waiting: number, creator: string | null): string =>
  [
    `${countOf(uploadCount, 'Datei', 'Dateien')} hochgeladen`,
    `${waiting.toLocaleString('de-DE')} im Eingang`,
    ...(creator === null ? [] : [`von ${creator}`]),
  ].join(' · ');

const DAY_FORMAT = new Intl.DateTimeFormat('de-DE', {
  weekday: 'short',
  day: 'numeric',
  month: 'numeric',
});

const MOMENT_FORMAT = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
});

export const dayLabelOf = (instant: string): string => DAY_FORMAT.format(new Date(instant));

export const momentLabelOf = (instant: string): string => MOMENT_FORMAT.format(new Date(instant));

export const remainingLabelOf = (remaining: Remaining): string => {
  switch (remaining.unit) {
    case 'days':
      return `noch ${countOf(remaining.count, 'Tag', 'Tage')}`;
    case 'hours':
      return `noch ${remaining.count.toLocaleString('de-DE')} Std.`;
    case 'over':
      return 'abgelaufen';
  }
};

export const ENDED_LABELS = { expired: 'abgelaufen', revoked: 'beendet' } as const;

export const hubMetaOf = (open: number, waiting: number): string =>
  `${open.toLocaleString('de-DE')} offen · ${waiting.toLocaleString('de-DE')} im Eingang`;

export const sortLabelOf = (waiting: number): string =>
  waiting === 0 ? 'Eingang öffnen' : `Eingang sortieren (${waiting.toLocaleString('de-DE')})`;

export const shareTextOf = (title: string): string => `${SHARE_TEXT_PREFIX} ${title}`;

export const PAGE_TITLE = 'Fotos hochladen';
export const PAGE_OPEN_UNTIL = 'Offen bis';
export const NAME_FIELD = 'Dein Name (freiwillig)';
export const PICK_LABEL = 'Fotos und Videos auswählen';
export const PICK_MORE_LABEL = 'Weitere auswählen';
export const PRIVACY_NOTE = 'Die Bilder sieht nur, wer im Verein die Galerie pflegt.';
export const KEEP_OPEN_NOTE = 'Lass die Seite offen, bis alles hochgeladen ist.';
export const CHECKING_LINE = 'Link wird geprüft …';
export const CLOSED_TITLES = {
  expired: 'DIESER LINK IST ABGELAUFEN',
  revoked: 'DIESER LINK WURDE BEENDET',
  unknown: 'DIESEN LINK GIBT ES NICHT',
  missing: 'HIER FEHLT DER LINK',
} as const;
export const CLOSED_LINES = {
  expired: 'Frag in der Gruppe nach einem neuen Link.',
  revoked: 'Frag in der Gruppe nach einem neuen Link.',
  unknown: 'Öffne den Link noch einmal aus der Nachricht.',
  missing: 'Öffne den Link vollständig, mit allem nach dem #.',
} as const;
export const FAILED_TITLE = 'Der Link ließ sich gerade nicht prüfen.';
export const FAILED_LINE = 'Prüf deine Verbindung und versuch es noch einmal.';
