import type { KkAspect, KkCropFrameLabels } from '@furria/ui';
import { aspectOf } from '@furria/ui';
import type { QueryErrorKind } from '@/lib/query-error';
import { toQueryErrorMessage } from '@/lib/query-error';
import type { BoardSummary, PositionStatus, SlotFlag } from './website-board';

export const WEBSITE_TITLE = 'Website';
export const WEBSITE_PATH = '/gallery/website';
export const ORPHANS_TITLE = 'Nicht mehr auf der Website';
export const ORPHANS_META = 'Die Website fragt diese Plätze nicht mehr ab';
export const ALL_PAGES_PATH = 'alle Seiten';
export const DESK_EMPTY = 'Wähl ein Bild in der Liste, um es zu bearbeiten.';
export const LOADING_LABEL = 'Bildplätze werden geladen';
export const LOAD_ERROR_TITLE = 'BILDPLÄTZE NICHT GELADEN';
const LOAD_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Die Bildplätze der Website konnten nicht geladen werden.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};

export const toLoadErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, LOAD_ERROR_MESSAGES);
export const RETRY_LABEL = 'Erneut laden';
export const CLOSE_LABEL = 'Schließen';
export const CANCEL_LABEL = 'Abbrechen';

export const DESK_ACTIONS = {
  upload: 'Hochladen',
  gallery: 'Aus der Galerie',
  copy: 'Gleiches Foto wie …',
  crop: 'Zuschneiden',
  recut: 'Neu zuschneiden',
  remove: 'Entfernen',
  cropDone: 'Übernehmen',
  retry: 'Erneut hochladen',
} as const;

export const CROP_LABELS: KkCropFrameLabels = {
  frame: 'Ausschnitt – ziehen zum Verschieben, Pfeiltasten verschieben, Plus und Minus zoomen',
  zoom: 'Zoom',
};

export const REPLACE_NOTE = 'Ein neues Foto ersetzt das jetzige sofort auf der Website.';
export const LIVE_NOTE = 'Jede Änderung ist sofort auf der Website zu sehen.';
export const RECUT_NOTE =
  'Das Format auf der Website hat sich geändert. Schneide das Foto neu zu, sonst wird es verzerrt beschnitten.';
export const FAILED_NOTE = 'Dieses Foto ließ sich nicht verarbeiten. Lade bitte ein anderes hoch.';
export const PROCESSING_NOTE = 'Das Foto wird gerade aufbereitet. Das dauert nur einen Moment.';
export const UNREADABLE_NOTE =
  'Dieses Foto kann hier nicht angezeigt werden. Es wird mittig zugeschnitten hochgeladen – den Ausschnitt kannst du danach ändern.';
export const NOTICES = {
  cropped: 'Zuschnitt gespeichert – jetzt auf der Website.',
  described: 'Bildbeschreibung gespeichert.',
  removed: 'Foto von der Website genommen.',
  placed: 'Foto übernommen – es wird gerade aufbereitet.',
  uploaded: 'Foto hochgeladen – es wird gerade aufbereitet.',
  transferred: 'Foto auf den Bildplatz übertragen.',
} as const;
export const ACTION_FAILED = 'Das Bild konnte nicht geändert werden.';

export const DESK_SHEET_ID = 'website-position-desk';
export const GALLERY_SHEET_ID = 'website-gallery-pick';
export const GALLERY_NOTE = 'Das Foto wird für die Website kopiert. Das Album bleibt unverändert.';
export const GALLERY_EMPTY = 'Kein Album mit fertigen Fotos.';
export const galleryTitleOf = (positionName: string): string => `Foto für ${positionName}`;

export const COPY_SHEET_ID = 'website-copy-pick';
export const COPY_TITLE = 'Gleiches Foto wie …';
export const COPY_NOTE =
  'Nimmt das Original eines anderen Bildplatzes mit eigenem Zuschnitt. Die Bildbeschreibung wird übernommen.';
export const COPY_EMPTY = 'Noch kein anderer Bildplatz hat ein fertiges Foto.';

export const TRANSFER_SHEET_ID = 'website-transfer-pick';
export const TRANSFER_TITLE = 'Auf Bildplatz übertragen';
export const TRANSFER_NOTE = 'Nur freie Plätze im gleichen Format.';
export const TRANSFER_LABEL = 'Übertragen';
export const TRANSFER_NONE = 'Kein freier Platz im gleichen Format';

export const ALT_REQUIRED_LABEL = 'Bildbeschreibung (Pflicht)';
export const ALT_HINT =
  'Was ist zu sehen? Wer, was, wo – in einem Satz, ohne „Foto von“. Screenreader lesen das vor.';
export const ALT_SHARE_HINT = 'Wird auch als Bildbeschreibung in Link-Vorschauen mitgeschickt.';
export const ALT_DECORATIVE = 'Schmückendes Bild – braucht keine Bildbeschreibung.';
export const ALT_SAVE = 'Beschreibung speichern';
export const ALT_COPIED = 'Vom anderen Bildplatz übernommen – passt sie hier?';
export const ALT_MAX = 300;
export const altCountOf = (used: number, max: number): string => `${used} / ${max}`;

export const REMOVE_EYEBROW = 'Website-Bild';
export const REMOVE_QUESTION = 'Foto von der Website nehmen?';
export const REMOVE_EXPLANATION =
  'Das Foto verschwindet sofort von der Website und wird gelöscht – es landet nicht im Papierkorb. Der Platz zeigt wieder die Vereinsfläche.';
export const REMOVE_CONFIRM = 'Endgültig entfernen';
export const REMOVE_KEEP = 'Behalten';
export const REMOVE_FACT = 'Platz';

const FLAG_TEXTS: Record<SlotFlag, string> = {
  failed: 'Fehlgeschlagen',
  mismatch: 'Zuschnitt passt nicht mehr',
  altMissing: 'Beschreibung fehlt',
  processing: 'Wird aufbereitet',
  empty: 'Leer',
};

export const flagTextOf = (flag: SlotFlag): string => FLAG_TEXTS[flag];

const STATUS_WORDS: Record<PositionStatus, string> = {
  empty: 'leer',
  processing: 'wird aufbereitet',
  failed: 'fehlgeschlagen',
  ready: 'belegt',
  mismatch: 'Zuschnitt passt nicht mehr',
};

export const statusWordOf = (status: PositionStatus): string => STATUS_WORDS[status];

const NAMED_ASPECTS: readonly { aspect: KkAspect; word: string }[] = [
  { aspect: 'landscape', word: 'quer 7:5' },
  { aspect: 'portrait', word: 'hoch 4:5' },
  { aspect: 'shareImage', word: 'Linkvorschau 1,91:1' },
];

const ASPECT_TOLERANCE = 1e-3;
const ASPECT_DIGITS = 2;

export const aspectWordOf = (aspect: KkAspect): string => {
  const ratio = aspectOf(aspect);
  const named = NAMED_ASPECTS.find(
    (candidate) => Math.abs(aspectOf(candidate.aspect) - ratio) < ASPECT_TOLERANCE,
  );
  return named?.word ?? `${ratio.toFixed(ASPECT_DIGITS).replace('.', ',')}:1`;
};

export const positionNameOf = (slotTitle: string, position: number, count: number): string =>
  count === 1 ? slotTitle : `${slotTitle}, Platz ${position} von ${count}`;

export const positionLabelOf = (
  slotTitle: string,
  position: number,
  count: number,
  aspect: KkAspect,
  status: PositionStatus,
): string =>
  `${positionNameOf(slotTitle, position, count)}, ${aspectWordOf(aspect)}, ${statusWordOf(status)}`;

export const slotFactsOf = (aspects: readonly KkAspect[], filled: number): string => {
  const formats = [...new Set(aspects.map(aspectWordOf))].join(' · ');
  return aspects.length === 1 ? formats : `${filled} von ${aspects.length} belegt · ${formats}`;
};

export const pageMetaOf = (path: string | null): string => path ?? ALL_PAGES_PATH;

export const fillTrailOf = (filled: number, total: number): string => `${filled}/${total}`;

export const summaryLineOf = ({ filled, total, altMissing, mismatched }: BoardSummary): string =>
  [
    `${filled} von ${total} belegt`,
    altMissing === 0 ? null : `${altMissing} ohne Beschreibung`,
    mismatched === 0 ? null : `${mismatched} Zuschnitt passt nicht mehr`,
  ]
    .filter((part) => part !== null)
    .join(' · ');

export const updatedLineOf = (name: string | null, at: string): string => {
  const when = new Date(at).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  return name === null ? `geändert ${when}` : `${name} · ${when}`;
};

export const orphanNameOf = (slot: string, position: number): string =>
  `${slot} · Platz ${position}`;

export const HUB_TRAIL = 'Bildplätze ▸';
export const HUB_TITLE_LABEL = 'Bildplätze der Website öffnen';
