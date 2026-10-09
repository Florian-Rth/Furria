import type { KkLightTableLabels } from '@furria/ui';
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
export const COMMIT_FAILED = 'Abschließen hat nicht geklappt. Deine Entscheidungen sind noch da.';

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

export const tallyLineOf = (filed: number, rejected: number, developing: number): string =>
  [
    'übrig',
    `${countLabel(filed)} abgelegt`,
    `${countLabel(rejected)} verworfen`,
    ...(developing === 0 ? [] : [`${countLabel(developing)} entwickeln noch`]),
  ].join(' · ');

export const doneSummaryOf = (filed: number, rejected: number): string =>
  `${countLabel(filed)} abgelegt · ${countLabel(rejected)} verworfen`;

export const inboxTitleOf = (owner: string | null): string =>
  owner === null ? 'Eingang' : `Eingang · ${owner}`;

export const inboxOptionLabelOf = (name: string, count: number): string =>
  `${name} · ${countLabel(count)}`;

export const stampOf = (title: string): string => title.split(' ')[0] ?? title;
