import { describe, expect, it } from 'vitest';
import {
  allPickedOf,
  arrangeToolsOf,
  castAssignsOf,
  castChoiceKindOf,
  castCountOf,
  compassPointOf,
  copyDefaultOf,
  copyShiftOf,
  copySourceOf,
  deskFitOf,
  firstJobOf,
  formationScopeOf,
  jobLaneOf,
  jobOfSetup,
  jobToolOf,
  pickedAfterHoldOf,
  pickedSpotOf,
  reasonsOf,
  selectionChipOf,
  stageGripOf,
  turnToOf,
} from './edit-jobs';

describe('jobToolOf', () => {
  it.each([
    ['steps', 'formation'],
    ['formation', 'formation'],
    ['movement', 'movement'],
    ['cast', 'formation'],
  ] as const)('%s edits the stage as %s', (job, tool) => {
    expect(jobToolOf(job)).toBe(tool);
  });
});

describe('stageGripOf', () => {
  it.each([
    ['steps', 'watch'],
    ['formation', 'arrange'],
    ['movement', 'move'],
    ['cast', 'pick'],
  ] as const)('%s lets the stage %s', (job, grip) => {
    expect(stageGripOf(job)).toBe(grip);
  });
});

describe('jobLaneOf', () => {
  it.each([
    ['steps', 'steps'],
    ['formation', 'slim'],
    ['movement', 'keys'],
    ['cast', 'slim'],
  ] as const)('%s brings the %s lane forward', (job, lane) => {
    expect(jobLaneOf(job)).toBe(lane);
  });
});

describe('deskFitOf', () => {
  it.each([
    ['steps', 'timeline'],
    ['formation', 'stage'],
    ['movement', 'balanced'],
    ['cast', 'stage'],
  ] as const)('%s gives the room to the %s', (job, fit) => {
    expect(deskFitOf(job)).toBe(fit);
  });
});

describe('jobOfSetup', () => {
  it.each([
    ['steps', 'steps'],
    ['spots', 'cast'],
    ['formation', 'formation'],
    ['music', null],
    ['video', null],
    ['final', null],
  ] as const)('setup row %s opens %s', (key, job) => {
    expect(jobOfSetup(key)).toBe(job);
  });
});

describe('firstJobOf', () => {
  it.each([
    [0, 'steps'],
    [1, 'formation'],
    [13, 'formation'],
  ] as const)('%i steps start on %s', (count, job) => {
    expect(firstJobOf(count)).toBe(job);
  });
});

describe('castCountOf', () => {
  it('counts spots and the held ones', () => {
    expect(
      castCountOf([{ person: { personId: 1 } }, { person: null }, { person: { personId: 2 } }]),
    ).toEqual({
      spots: 3,
      held: 2,
    });
  });

  it('counts nothing without spots', () => {
    expect(castCountOf([])).toEqual({ spots: 0, held: 0 });
  });
});

describe('formationScopeOf', () => {
  it.each([
    [0, 12, { kind: 'all', count: 12 }],
    [3, 12, { kind: 'chosen', count: 3 }],
  ] as const)('%i selected of %i', (selected, total, scope) => {
    expect(formationScopeOf(selected, total)).toEqual(scope);
  });
});

describe('pickedSpotOf', () => {
  it.each([
    [[], null],
    [[5], 5],
    [[5, 6], null],
  ] as const)('%j picks %s', (selected, spot) => {
    expect(pickedSpotOf(selected)).toBe(spot);
  });
});

describe('pickedAfterHoldOf', () => {
  it.each([
    [[], 5, [5]],
    [[5], 5, null],
    [[3, 4], 5, [5]],
  ] as const)('%j held on %i → %j', (selected, spotId, next) => {
    expect(pickedAfterHoldOf(selected, spotId)).toEqual(next);
  });
});

describe('reasonsOf', () => {
  it('lists each reason of the disabled actions once, in order', () => {
    expect(
      reasonsOf([
        { disabled: false, reason: 'noSpots' },
        { disabled: true, reason: 'noMusic' },
        { disabled: true, reason: null },
        { disabled: true, reason: 'noMusic' },
        { disabled: true, reason: 'lastStep' },
      ]),
    ).toEqual(['noMusic', 'lastStep']);
  });
});

describe('selectionChipOf', () => {
  it.each([
    ['formation', 0, 12, 'none'],
    ['steps', 3, 12, 'none'],
    ['formation', 1, 12, 'count'],
    ['movement', 3, 12, 'count'],
    ['cast', 1, 12, 'spot'],
    ['cast', 2, 12, 'count'],
    ['formation', 12, 12, 'all'],
    ['cast', 1, 1, 'spot'],
  ] as const)('%s with %i of %i chosen shows %s', (job, selected, total, chip) => {
    expect(selectionChipOf(job, selected, total)).toBe(chip);
  });
});

describe('allPickedOf', () => {
  it.each([
    [0, 0, false],
    [3, 12, false],
    [12, 12, true],
  ] as const)('%i of %i → %s', (selected, total, all) => {
    expect(allPickedOf(selected, total)).toBe(all);
  });
});

describe('arrangeToolsOf', () => {
  it.each([
    [0, []],
    [1, ['mirror']],
    [2, ['mirror', 'rowAcross', 'rowDeep']],
    [7, ['mirror', 'rowAcross', 'rowDeep']],
  ] as const)('%i chosen offers %j', (selected, tools) => {
    expect(arrangeToolsOf(selected)).toEqual(tools);
  });
});

describe('copyDefaultOf', () => {
  it.each([
    [0, 13, 1],
    [4, 13, 3],
    [0, 1, null],
    [-1, 13, null],
  ] as const)('step index %i of %i copies from %s', (current, steps, source) => {
    expect(copyDefaultOf(current, steps)).toBe(source);
  });
});

describe('copySourceOf', () => {
  it.each([
    [null, 4, 13, 3],
    [7, 4, 13, 7],
    [4, 4, 13, 3],
    [20, 4, 13, 3],
  ] as const)('pick %s at %i of %i → %i', (pick, current, steps, source) => {
    expect(copySourceOf(pick, current, steps)).toBe(source);
  });
});

describe('copyShiftOf', () => {
  it.each([
    [3, 1, 4, 13, 5],
    [5, -1, 4, 13, 3],
    [1, -1, 0, 13, null],
    [12, 1, 4, 13, null],
    [1, -1, 4, 13, 0],
  ] as const)('from %i by %i at %i of %i → %s', (source, direction, current, steps, next) => {
    expect(copyShiftOf(source, direction, current, steps)).toBe(next);
  });
});

describe('compassPointOf', () => {
  it.each([
    [null, null],
    [0, 0],
    [90, 90],
    [100, 90],
    [350, 0],
    [-45, 315],
  ] as const)('facing %s points %s', (facing, point) => {
    expect(compassPointOf(facing)).toBe(point);
  });
});

describe('turnToOf', () => {
  it.each([
    [null, 90, 90],
    [45, 0, -45],
    [270, 315, 45],
  ] as const)('from %s to %i turns by %i', (facing, target, delta) => {
    expect(turnToOf(facing, target)).toBe(delta);
  });
});

describe('castChoiceKindOf', () => {
  const spots = [
    { spotId: 1, number: 1, personId: 10 },
    { spotId: 2, number: 4, personId: 20 },
    { spotId: 3, number: 5, personId: null },
  ];

  it.each([
    [1, 10, { kind: 'here' }],
    [1, 20, { kind: 'swap', number: 4 }],
    [3, 30, { kind: 'free' }],
  ] as const)('spot %i offering person %i is %j', (spotId, personId, kind) => {
    expect(castChoiceKindOf(spots, spotId, personId)).toEqual(kind);
  });
});

describe('castAssignsOf', () => {
  const spots = [
    { spotId: 1, number: 1, personId: 10 },
    { spotId: 2, number: 4, personId: 20 },
    { spotId: 3, number: 5, personId: null },
  ];

  it('places a free person on the spot', () => {
    expect(castAssignsOf(spots, 3, 30)).toEqual([{ spotId: 3, personId: 30 }]);
  });

  it('swaps a person from another spot with the one standing here', () => {
    expect(castAssignsOf(spots, 1, 20)).toEqual([
      { spotId: 2, personId: 10 },
      { spotId: 1, personId: 20 },
    ]);
  });

  it('frees the other spot when this spot was free', () => {
    expect(castAssignsOf(spots, 3, 20)).toEqual([
      { spotId: 2, personId: null },
      { spotId: 3, personId: 20 },
    ]);
  });

  it('changes nothing for the person already here', () => {
    expect(castAssignsOf(spots, 1, 10)).toEqual([]);
  });
});
