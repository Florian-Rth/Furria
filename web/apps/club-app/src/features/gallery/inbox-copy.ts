import type { KkLightTableLabels } from '@furria/ui';
import type { QueryErrorKind } from '@/lib/query-error';
import { toQueryErrorMessage } from '@/lib/query-error';
import { countLabel } from './gallery-view';
import type { CommitPlan } from './inbox-desk';
import { committedIdsOf } from './inbox-desk';

export const LIGHT_TABLE_LABELS: KkLightTableLabels = {
  dialog: 'Eingang sichten',
  close: 'Schließen',
  undo: 'Rückgängig',
  reject: 'Verwerfen',
  confirm: 'Ja',
  cancel: 'Abbrechen',
  settings: 'Körbe und Eingang wählen',
};

export const KEY_HINT =
  '← → blättern · X verwerfen · 1–3 ablegen · ⇧ ganze Szene · Z zurück · ⏎ abschließen';

export const SHEET_TITLE = 'Leuchttisch';
export const SHEET_CLOSE = 'Fertig';
export const INBOX_FIELD = 'Eingang von';
export const BASKETS_TITLE = 'Körbe';
export const EMPTY_BASKET = 'Leerer Korb';
export const NO_ALBUM = 'Kein Album';
export const NEW_ALBUM_FIELD = 'Neues Album';
export const NEW_ALBUM_ACTION = 'Anlegen';
export const MY_INBOX = 'Mein Eingang';
export const OWNERLESS_INBOX = 'Ohne Besitzer';
export const DONE_HEADLINE = 'EINGANG LEER';

export const basketFieldOf = (slot: number): string => `Korb ${slot + 1}`;

const amountsOf = (filed: number, rejected: number): string[] => [
  ...(filed === 0 ? [] : [`${countLabel(filed)} ablegen`]),
  ...(rejected === 0 ? [] : [`${countLabel(rejected)} verwerfen`]),
];

export const commitLabelOf = (plan: CommitPlan): string =>
  [
    'Abschließen',
    ...amountsOf(committedIdsOf(plan).length - plan.rejects.length, plan.rejects.length),
  ].join(' · ');

export const closeQuestionOf = (plan: CommitPlan): string =>
  `Vor dem Schließen abschließen? ${amountsOf(
    committedIdsOf(plan).length - plan.rejects.length,
    plan.rejects.length,
  ).join(' · ')}`;

export const sceneQuestionOf = (count: number, basket: string | null): string =>
  basket === null
    ? `${countLabel(count)} Bilder dieser Szene verwerfen?`
    : `${countLabel(count)} Bilder dieser Szene nach „${basket}“?`;

interface UnfinishedItems {
  developing: number;
  stalled: number;
  failed: number;
}

const countedPart = (count: number, words: string): string[] =>
  count === 0 ? [] : [`${countLabel(count)} ${words}`];

export const tallyLineOf = (
  filed: number,
  rejected: number,
  { developing, stalled, failed }: UnfinishedItems,
): string =>
  [
    'übrig',
    `${countLabel(filed)} abgelegt`,
    `${countLabel(rejected)} verworfen`,
    ...countedPart(developing, 'entwickeln noch'),
    ...countedPart(stalled, 'brauchen ungewöhnlich lange'),
    ...countedPart(failed, 'ließen sich nicht entwickeln'),
  ].join(' · ');

export const doneSummaryOf = (filed: number, rejected: number): string =>
  `${countLabel(filed)} abgelegt · ${countLabel(rejected)} verworfen`;

export const inboxTitleOf = (owner: string | null): string =>
  owner === null ? 'Eingang' : `Eingang · ${owner}`;

export const inboxOptionLabelOf = (name: string, count: number): string =>
  `${name} · ${countLabel(count)}`;

export const stampOf = (title: string): string => title.split(' ')[0] ?? title;

export const INBOX_ERROR_TITLE = 'EINGANG NICHT GELADEN';
export const INBOX_RETRY_LABEL = 'Erneut laden';

const INBOX_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Der Eingang konnte nicht geladen werden.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};

export const toInboxErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, INBOX_ERROR_MESSAGES);

export const failedItemsLineOf = (count: number): string =>
  count === 1
    ? '1 Datei ließ sich nicht verarbeiten.'
    : `${countLabel(count)} Dateien ließen sich nicht verarbeiten.`;

export const DISCARD_FAILED_LABEL = 'Verwerfen';
