import { describe, expect, it } from 'vitest';
import type { MatchReason } from './match-reasons';
import {
  buildAnsweredSummary,
  buildProgressLabel,
  buildReasonAnswerLine,
  joinGroupNames,
  resolveRecruitingBadge,
} from './matcher-content';

describe('buildProgressLabel', () => {
  it('counts the question the visitor is looking at', () => {
    expect(buildProgressLabel(0, 11)).toBe('Frage 1 von 11');
    expect(buildProgressLabel(10, 11)).toBe('Frage 11 von 11');
  });

  it('stops counting once every question is behind the visitor', () => {
    expect(buildProgressLabel(11, 11)).toBe('Alle Fragen durch');
  });
});

describe('buildAnsweredSummary', () => {
  it('reports the answers given, or says outright that there were none', () => {
    expect(buildAnsweredSummary(9, 11)).toBe('Du hast 9 von 11 Fragen beantwortet.');
    expect(buildAnsweredSummary(0, 11)).toBe('Du hast jede Frage übersprungen.');
  });
});

describe('joinGroupNames', () => {
  it('joins the names the way German writes a list', () => {
    expect(joinGroupNames(['Tanzgarde'])).toBe('Tanzgarde');
    expect(joinGroupNames(['Tanzgarde', 'Elferrat'])).toBe('Tanzgarde und Elferrat');
    expect(joinGroupNames(['Tanzgarde', 'Elferrat', 'Organisation'])).toBe(
      'Tanzgarde, Elferrat und Organisation',
    );
  });
});

describe('buildReasonAnswerLine', () => {
  it('puts the visitor answer next to the one the group gave', () => {
    const reason: MatchReason = {
      questionId: 'stage',
      prompt: 'Ich will auf die Bühne.',
      agreement: 'partial',
      answer: 'neutral',
      stance: 'yes',
      importance: 3,
    };

    expect(buildReasonAnswerLine(reason, 'Tanzgarde')).toBe(
      'Du: Neutral · Tanzgarde: Ja · der Gruppe besonders wichtig',
    );
  });
});

describe('resolveRecruitingBadge', () => {
  it('separates a recruiting group from one that is not looking', () => {
    expect(resolveRecruitingBadge(true).color).toBe('success');
    expect(resolveRecruitingBadge(false).color).toBe('default');
    expect(resolveRecruitingBadge(true).label).not.toBe(resolveRecruitingBadge(false).label);
  });
});
