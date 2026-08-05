import { describe, expect, it } from 'vitest';
import { SEEDED_GROUP_MATCHER } from '@/lib/seed/group-matcher';
import type { MatchReason } from './match-reasons';
import {
  buildAnsweredSummary,
  buildExclusionReason,
  buildHandoffNote,
  buildMatchPercentageLabel,
  buildProgressLabel,
  buildRankLabel,
  buildReasonAnswerLine,
  buildWhyLabel,
  joinGroupNames,
  matcherIntro,
  matcherKicker,
  matcherStanceChoices,
  matcherTitle,
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
  it('reports how many answers the visitor gave', () => {
    expect(buildAnsweredSummary(9, 11)).toBe('Du hast 9 von 11 Fragen beantwortet.');
  });

  it('says so plainly when every question was skipped', () => {
    expect(buildAnsweredSummary(0, 11)).toBe('Du hast jede Frage übersprungen.');
  });
});

describe('the Matcher copy', () => {
  it('offers exactly the three stances a Gruppe can hold', () => {
    expect(matcherStanceChoices.map((choice) => choice.value)).toEqual(['yes', 'neutral', 'no']);
  });

  it('is never an -O-Mat', () => {
    expect(`${matcherKicker} ${matcherTitle}`.toLowerCase()).not.toContain('-mat');
  });

  it('promises as many questions as the payload asks', () => {
    expect(matcherIntro).toContain('Elf Fragen');
    expect(SEEDED_GROUP_MATCHER.questions).toHaveLength(11);
  });

  it('says outright that the seeded questions are placeholders', () => {
    expect(matcherIntro).toContain('Platzhalter');
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

describe('buildHandoffNote', () => {
  it('names exactly the Gruppen the Antrag will carry along', () => {
    const note = buildHandoffNote(['Tanzgarde', 'Elferrat']);

    expect(note).toContain('Tanzgarde und Elferrat');
    expect(note).toContain('ändern');
  });
});

describe('buildReasonAnswerLine', () => {
  it('puts the visitor answer next to the one the Gruppe gave', () => {
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

describe('buildExclusionReason', () => {
  it('names the answer that ruled the Gruppe out', () => {
    expect(buildExclusionReason('Wie alt bist du?', '18 oder älter')).toBe(
      'Deine Antwort „18 oder älter“ auf „Wie alt bist du?“ schließt diese Gruppe aus.',
    );
  });
});

describe('resolveRecruitingBadge', () => {
  it('says that a Gruppe is looking for new people', () => {
    expect(resolveRecruitingBadge(true)).toEqual({
      label: 'Sucht Verstärkung',
      note: 'Diese Gruppe sucht gerade neue Leute.',
      color: 'success',
    });
  });

  it('stays honest about a Gruppe that is not looking, and still invites an Anfrage', () => {
    const badge = resolveRecruitingBadge(false);

    expect(badge.label).toBe('Sucht gerade nicht');
    expect(badge.note).toContain('Anfrage');
    expect(badge.color).toBe('default');
  });
});

describe('the result labels', () => {
  it('prints the match as a percentage a screen reader can read out', () => {
    expect(buildMatchPercentageLabel(83, 'Büttenrede')).toBe('83 % Übereinstimmung mit Büttenrede');
  });

  it('numbers the rank and names the Gruppe in the why toggle', () => {
    expect(buildRankLabel(2)).toBe('2.');
    expect(buildWhyLabel('Elferrat')).toBe('Warum Elferrat?');
  });
});
