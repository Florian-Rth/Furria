import { KkAgendaActs } from './internal/layout/KkAgendaActs';
import { KkAgendaRoot } from './internal/layout/KkAgendaRoot';
import { KkAgendaAct } from './internal/ui/KkAgendaAct';
import { KkAgendaAnswer } from './internal/ui/KkAgendaAnswer';
import { KkAgendaCast } from './internal/ui/KkAgendaCast';
import { KkAgendaFact } from './internal/ui/KkAgendaFact';
import { KkAgendaMore } from './internal/ui/KkAgendaMore';
import { KkAgendaRow } from './internal/ui/KkAgendaRow';
import { KkAgendaStrip } from './internal/ui/KkAgendaStrip';
import { KkAgendaWeek } from './internal/ui/KkAgendaWeek';

export type { KkAgendaAnswerValue } from './internal/ui/KkAgendaAnswer';
export type { KkAgendaCastName } from './internal/ui/KkAgendaCast';
export type { KkAgendaFactTone } from './internal/ui/KkAgendaFact';
export type { KkAgendaRowMark } from './internal/ui/KkAgendaRow';

export const KkAgenda = Object.assign(KkAgendaRoot, {
  Strip: KkAgendaStrip,
  Week: KkAgendaWeek,
  Row: KkAgendaRow,
  Fact: KkAgendaFact,
  Answer: KkAgendaAnswer,
  More: KkAgendaMore,
  Cast: KkAgendaCast,
  Acts: KkAgendaActs,
  Act: KkAgendaAct,
});
