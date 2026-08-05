import { describe, expect, it } from 'vitest';
import { buildJoinStepNumeral, JOIN_STEPS, joinStepsIntro } from './steps-content';

const allStepCopy = [
  joinStepsIntro,
  ...JOIN_STEPS.flatMap((step) => [step.title, step.description]),
].join(' ');

describe('buildJoinStepNumeral', () => {
  it('numbers the first step 01', () => {
    expect(buildJoinStepNumeral(0)).toBe('01');
  });

  it('pads every single-digit step', () => {
    expect(buildJoinStepNumeral(3)).toBe('04');
  });

  it('stops padding once the count runs into two digits', () => {
    expect(buildJoinStepNumeral(9)).toBe('10');
  });
});

describe('JOIN_STEPS', () => {
  it('walks the four steps in the order they happen', () => {
    expect(JOIN_STEPS.map((step) => step.title)).toEqual([
      'Gruppe finden',
      'Antrag stellen',
      'Aufnahme',
      'Willkommen',
    ]);
  });

  it('lets the first step end without a Gruppe', () => {
    expect(JOIN_STEPS[0]?.description).toContain('ohne Gruppe');
  });

  it('promises the Antrag takes two minutes', () => {
    expect(JOIN_STEPS[1]?.description).toContain('zwei Minuten');
  });

  it('says who decides the Aufnahme and that we get back in touch', () => {
    const aufnahme = JOIN_STEPS[2]?.description ?? '';

    expect(aufnahme).toContain('Wir entscheiden');
    expect(aufnahme).toContain('melden uns');
  });

  it('keeps every step filled in', () => {
    for (const step of JOIN_STEPS) {
      expect(step.description.length).toBeGreaterThan(0);
    }
  });
});

describe('the steps copy', () => {
  it('never names a Vorstand', () => {
    expect(allStepCopy.toLowerCase()).not.toContain('vorstand');
  });

  it('never invites anyone to drop in on a training', () => {
    expect(allStepCopy.toLowerCase()).not.toContain('vorbeikommen');
    expect(allStepCopy.toLowerCase()).not.toContain('vorbeischauen');
  });
});
