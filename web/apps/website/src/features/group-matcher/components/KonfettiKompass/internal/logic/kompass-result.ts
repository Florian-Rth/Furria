import { buildApplyHref, selectHandoffGroups } from '@/features/group-matcher/apply-handoff';
import type { KompassRecruitingBadge } from '@/features/group-matcher/kompass-content';
import {
  buildExclusionReason,
  buildHandoffNote,
  resolveRecruitingBadge,
} from '@/features/group-matcher/kompass-content';
import type { MatchReason } from '@/features/group-matcher/match-reasons';
import { buildMatchReasons } from '@/features/group-matcher/match-reasons';
import type { MatcherAnswers } from '@/features/group-matcher/schemas';
import type { GroupExclusion, GroupMatch } from '@/features/group-matcher/scoring';
import { rankGroups } from '@/features/group-matcher/scoring';
import type { GroupMatcher, MatcherQuestion } from '@/lib/seed/group-matcher';
import type { Group } from '@/lib/seed/groups';

export interface KompassMatchView {
  group: Group;
  rank: number;
  percentage: number;
  badge: KompassRecruitingBadge;
  reasons: MatchReason[];
}

export interface KompassExclusionView {
  group: Group;
  reason: string;
}

export interface KompassUnansweredView {
  kind: 'unanswered';
}

export interface KompassEmptyView {
  kind: 'empty';
  excluded: KompassExclusionView[];
}

export interface KompassRankingView {
  kind: 'ranking';
  top: KompassMatchView;
  rest: KompassMatchView[];
  excluded: KompassExclusionView[];
  applyHref: string;
  handoffNote: string;
}

export type KompassResultView = KompassUnansweredView | KompassEmptyView | KompassRankingView;

const toExclusionViews = (excluded: GroupExclusion[]): KompassExclusionView[] =>
  excluded.map((exclusion) => ({
    group: exclusion.group,
    reason: buildExclusionReason(exclusion.questionPrompt, exclusion.answerLabel),
  }));

const toMatchViews = (
  matches: GroupMatch[],
  questions: MatcherQuestion[],
  answers: MatcherAnswers,
): KompassMatchView[] =>
  matches.map((match, index) => ({
    group: match.group,
    rank: index + 1,
    percentage: match.percentage,
    badge: resolveRecruitingBadge(match.group.isRecruiting),
    reasons: buildMatchReasons(match.group, questions, answers),
  }));

export const selectKompassResult = (
  matcher: GroupMatcher,
  answers: MatcherAnswers,
): KompassResultView => {
  const outcome = rankGroups(matcher, answers);

  if (outcome.status === 'unanswered') {
    return { kind: 'unanswered' };
  }

  if (outcome.status === 'no-matches') {
    return { kind: 'empty', excluded: toExclusionViews(outcome.excluded) };
  }

  const [top, ...rest] = toMatchViews(outcome.matches, matcher.questions, answers);

  if (top === undefined) {
    return { kind: 'unanswered' };
  }

  const handoffGroups = selectHandoffGroups(outcome.matches);

  return {
    kind: 'ranking',
    top,
    rest,
    excluded: toExclusionViews(outcome.excluded),
    applyHref: buildApplyHref(handoffGroups.map((group) => group.id)),
    handoffNote: buildHandoffNote(handoffGroups.map((group) => group.name)),
  };
};
