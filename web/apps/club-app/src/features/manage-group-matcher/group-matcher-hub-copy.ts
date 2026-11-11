import type { KkConfirmFact } from '@furria/ui/KkConfirmDialog';
import type { KkCoverageGridLegendEntry } from '@furria/ui/KkCoverageGrid';
import type { KkIconName } from '@furria/ui/KkIcon';
import type { KkStepState } from '@furria/ui/step-state';
import type { StatementState } from '@/features/group-matcher/schemas';
import { APPROVED_STATEMENT_LIMIT } from '@/features/group-matcher/schemas';
import type { QueryErrorKind } from '@/lib/query-error';
import { toQueryErrorMessage } from '@/lib/query-error';
import type { PoolGroup, PoolStatement, WaitingProposal } from './schemas';
import type { CoverageTally } from './statement-pool';

export const HUB_TITLE = 'Jeck-Check';
export const LOADING_LABEL = 'Der Jeck-Check wird geladen';
export const RETRY_LABEL = 'Erneut laden';
export const CLOSE_LABEL = 'Schließen';
export const GONE_NOTE = 'Diesen Eintrag gibt es nicht mehr.';

export const PROPOSALS_TITLE = 'Vorschläge';
export const PROPOSALS_LABEL = 'Vorschläge der Gruppen';
export const PROPOSALS_EMPTY = 'Kein Vorschlag offen.';
export const OPEN_PROPOSAL_LABEL = 'Vorschlag prüfen';
export const APPROVE_LABEL = 'Aufnehmen';
export const REJECT_LABEL = 'Ablehnen';
export const POOL_FULL_NOTE = `${APPROVED_STATEMENT_LIMIT} Aussagen sind aufgenommen. Lösch zuerst eine.`;
export const PROPOSAL_STATE_LABEL = 'offen';
const PROPOSAL_WITHOUT_GROUP = 'ohne Gruppe';

export const POOL_LABEL = 'Aussagen in Reihenfolge';
export const POOL_EMPTY = 'Noch keine Aussage aufgenommen.';

export const COVERAGE_TITLE = 'Abdeckung';
export const COVERAGE_LABEL = 'Antworten der Gruppen je Aussage';
export const COVERAGE_EMPTY = 'Noch keine Gruppe.';
export const COVERAGE_GROUP_HEAD = 'Gruppe';
export const COVERAGE_PART_HEAD = 'Dabei';

export const PROPOSAL_PANE_TITLE = 'Vorschlag';
export const STATEMENT_FIELD_LABEL = 'Aussage';
export const SAVE_LABEL = 'Speichern';
export const DELETE_LABEL = 'Löschen';

export const DELETE_EYEBROW = 'Aussage löschen';
export const DELETE_QUESTION = 'Diese Aussage löschen?';
export const DELETE_EXPLANATION = 'Die Antworten aller Gruppen zu dieser Aussage gehen mit.';
export const CANCEL_LABEL = 'Abbrechen';

export const APPROVED_MESSAGE = 'Aussage aufgenommen.';
export const REJECTED_MESSAGE = 'Vorschlag abgelehnt.';
export const REWORDED_MESSAGE = 'Aussage geändert.';
export const DELETED_MESSAGE = 'Aussage gelöscht.';

const COVERAGE_STATE_LABELS: Record<StatementState, string> = {
  answered: 'beantwortet',
  changed: 'geändert',
  new: 'neu',
  open: 'offen',
};

export const COVERAGE_STEP_STATES: Record<StatementState, KkStepState> = {
  answered: 'done',
  changed: 'overdue',
  new: 'current',
  open: 'open',
};

export const COVERAGE_LEGEND: readonly KkCoverageGridLegendEntry[] = (
  ['answered', 'changed', 'new', 'open'] as const
).map((state) => ({ state: COVERAGE_STEP_STATES[state], label: COVERAGE_STATE_LABELS[state] }));

export const COVERAGE_GROUP_LINES: readonly {
  key: 'answered' | 'changed' | 'waiting';
  label: string;
}[] = [
  { key: 'answered', label: 'Beantwortet' },
  { key: 'changed', label: 'Geändert' },
  { key: 'waiting', label: 'Offen' },
];

const NO_GROUP_LINE = '–';

const PAGE_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Der Jeck-Check konnte nicht geladen werden.',
  rejected: 'Dir fehlt die Berechtigung für diese Seite.',
};

export const toHubErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, PAGE_ERROR_MESSAGES);

export const toPoolTitle = (count: number): string =>
  `Aussagen · ${count} / ${APPROVED_STATEMENT_LIMIT}`;

export const toStatementHead = (index: number): string => `Aussage ${index + 1}`;

export const toStatementMoveLabel = (index: number): string =>
  `${toStatementHead(index)} verschieben`;

export interface CoverageColumn {
  key: string;
  head: string;
  label: string;
}

export const toCoverageColumns = (statements: readonly PoolStatement[]): CoverageColumn[] =>
  statements.map((statement, index) => ({
    key: String(statement.statementId),
    head: String(index + 1),
    label: `${toStatementHead(index)}: ${statement.text}`,
  }));

export const toCoverageCellLabel = (
  groupName: string,
  index: number,
  state: StatementState,
): string => `${groupName} · ${toStatementHead(index)}: ${COVERAGE_STATE_LABELS[state]}`;

export const COVERAGE_PART_ICON: KkIconName = 'checkCircle';

export const toTakingPartLabel = (groupName: string, isTakingPart: boolean): string =>
  `${groupName}: ${isTakingPart ? 'dabei' : 'nicht dabei'}`;

export const toTakingPartState = (isTakingPart: boolean): KkStepState =>
  isTakingPart ? 'done' : 'off';

export const toTallyMeta = (tally: CoverageTally): string => {
  const answered = `${tally.answered} von ${tally.groupCount} beantwortet`;

  return tally.changed > 0 ? `${answered} · ${tally.changed} geändert` : answered;
};

export const toProposalFact = (proposal: WaitingProposal): string =>
  proposal.proposedBy?.name ?? PROPOSAL_WITHOUT_GROUP;

export const toGroupLine = (groups: readonly PoolGroup[]): string =>
  groups.length === 0 ? NO_GROUP_LINE : groups.map((group) => group.name).join(', ');

export const toDeleteFacts = (tally: CoverageTally): KkConfirmFact[] => [
  { label: 'Beantwortet von', value: `${tally.answered + tally.changed} Gruppen` },
];
