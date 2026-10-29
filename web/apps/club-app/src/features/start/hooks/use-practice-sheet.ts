import { practiceActsOf, practiceLinkOf, toPracticeMeta } from '../practice-tile';
import type { StartBoard } from './use-start-view';

export interface PracticeChoice {
  key: number;
  label: string;
  meta: string | undefined;
  to: string;
  search: Record<string, string | number>;
}

export const usePracticeSheet = (board: StartBoard): PracticeChoice[] =>
  practiceActsOf(board.panels).map((act) => ({
    key: act.actId,
    label: act.name,
    meta: toPracticeMeta(act),
    ...practiceLinkOf(act),
  }));
