import { describe, expect, it } from 'vitest';
import { scoreDoorsOf } from './score-doors';

const viewer = (
  canEditStudio: boolean,
  canEditSettings: boolean,
  canGrantCoEditors: boolean,
  canMarkAttendance: boolean,
) => ({ inCast: true, canEditStudio, canEditSettings, canGrantCoEditors, canMarkAttendance });

const facts = { actId: 3, nextEveningId: 8, hallTrainingId: 40, playable: true };

describe('scoreDoorsOf', () => {
  it.each([
    [
      viewer(true, true, true, true),
      ['studio', 'music', 'evenings', 'trainings', 'hall', 'settings'],
    ],
    [viewer(true, false, false, false), ['studio', 'music', 'evenings', 'trainings', 'hall']],
    [viewer(false, true, false, true), ['trainings', 'hall', 'settings']],
    [viewer(false, false, false, true), []],
  ])('offers the doors the viewer may use', (who, expected) => {
    expect(scoreDoorsOf(who, facts).map((door) => door.key)).toEqual(expected);
  });

  it('leaves out the hall when nothing can be played', () => {
    expect(
      scoreDoorsOf(viewer(true, true, true, true), { ...facts, playable: false }).map(
        (door) => door.key,
      ),
    ).not.toContain('hall');
  });

  it('opens the next evening when there is one', () => {
    const door = scoreDoorsOf(viewer(true, false, false, false), facts).find(
      (candidate) => candidate.key === 'evenings',
    );

    expect(door?.link.to).toBe('/acts/3/details/evenings/8');
  });
});
