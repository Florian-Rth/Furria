import type { KkAnswerChoiceLabels } from '@furria/ui/KkAnswerChoice';
import type { KkChipTone } from '@furria/ui/KkChip';
import type { KkStatementMark } from '@furria/ui/KkStatementList';
import type { QueryErrorKind } from '@/lib/query-error';
import { toQueryErrorMessage } from '@/lib/query-error';
import type { GroupMatcherStanding } from './group-matcher-page';
import type { AdmissionAgeBand, Importance, StatementState } from './schemas';

export const GROUP_MATCHER_TITLE = 'Jeck-Check';

export const ADMISSION_AGE_LABELS: Record<AdmissionAgeBand, string> = {
  underTwelve: 'unter 12',
  twelveToThirteen: '12 bis 13',
  fourteenToFifteen: '14 bis 15',
  sixteenToSeventeen: '16 bis 17',
  eighteenPlus: '18 oder älter',
};

export const IMPORTANCE_LABELS: Record<Importance, string> = {
  1: 'nebensächlich',
  2: 'wichtig',
  3: 'besonders wichtig',
};

export const POSITION_LABELS: KkAnswerChoiceLabels = { yes: 'Ja', maybe: 'Neutral', no: 'Nein' };

export const STATEMENT_MARKS: Record<StatementState, KkStatementMark | null> = {
  new: { label: 'Neu', tone: 'accent' },
  changed: { label: 'Geändert', tone: 'gold' },
  open: { label: 'Offen', tone: 'gold' },
  answered: null,
};

interface StandingHint {
  label: string;
  tone: KkChipTone;
}

export const toStandingHint = (standing: GroupMatcherStanding): StandingHint => {
  switch (standing.kind) {
    case 'awaiting':
      return { label: `${standing.count} offen`, tone: 'gold' };
    case 'takingPart':
      return { label: 'dabei', tone: 'green' };
    case 'notTakingPart':
      return { label: 'nicht dabei', tone: 'neutral' };
  }
};

export const GROUP_MATCHER_DENIED_MESSAGE = 'Den Jeck-Check pflegt die Leitung der Gruppe.';

const PAGE_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Der Jeck-Check konnte nicht geladen werden.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};

export const toGroupMatcherErrorMessage = (error: Error): string =>
  toQueryErrorMessage(error, PAGE_ERROR_MESSAGES) ?? PAGE_ERROR_MESSAGES.unexpected;

export const IMPORTANCE_QUESTION = 'Wie wichtig ist das der Gruppe?';
