import { buildApplyHref, selectHandoffGroups } from '@/features/group-matcher/apply-handoff';
import type { MatchReason } from '@/features/group-matcher/match-reasons';
import { buildMatchReasons } from '@/features/group-matcher/match-reasons';
import type { MatcherRecruitingBadge } from '@/features/group-matcher/matcher-content';
import {
  buildExclusionReason,
  buildHandoffNote,
  resolveRecruitingBadge,
} from '@/features/group-matcher/matcher-content';
import type { MatcherAnswers } from '@/features/group-matcher/schemas';
import type { GroupExclusion, GroupMatch } from '@/features/group-matcher/scoring';
import { rankGroups } from '@/features/group-matcher/scoring';
import type { GroupMatcher, MatcherQuestion } from '@/lib/seed/group-matcher';
import type { Group } from '@/lib/seed/groups';

export interface MatcherMatchView {
  group: Group;
  rank: number;
  percentage: number;
  badge: MatcherRecruitingBadge;
  reasons: MatchReason[];
}

export interface MatcherExclusionView {
  group: Group;
  reason: string;
}

export interface MatcherUnansweredView {
  kind: 'unanswered';
}

export interface MatcherEmptyView {
  kind: 'empty';
  excluded: MatcherExclusionView[];
}

export interface MatcherRankingView {
  kind: 'ranking';
  top: MatcherMatchView;
  rest: MatcherMatchView[];
  excluded: MatcherExclusionView[];
  applyHref: string;
  handoffNote: string;
}

export type MatcherResultView = MatcherUnansweredView | MatcherEmptyView | MatcherRankingView;

const toExclusionViews = (excluded: GroupExclusion[]): MatcherExclusionView[] =>
  excluded.map((exclusion) => ({
    group: exclusion.group,
    reason: buildExclusionReason(exclusion.questionPrompt, exclusion.answerLabel),
  }));

const toMatchViews = (
  matches: GroupMatch[],
  questions: MatcherQuestion[],
  answers: MatcherAnswers,
): MatcherMatchView[] =>
  matches.map((match, index) => ({
    group: match.group,
    rank: index + 1,
    percentage: match.percentage,
    badge: resolveRecruitingBadge(match.group.isRecruiting),
    reasons: buildMatchReasons(match.group, questions, answers),
  }));

export const selectMatcherResult = (
  matcher: GroupMatcher,
  answers: MatcherAnswers,
): MatcherResultView => {
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
