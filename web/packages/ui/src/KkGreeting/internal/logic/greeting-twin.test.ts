import { describe, expect, it } from 'vitest';
import type { FlapCell } from './flap-cells';
import type { FlapSchedule, FlapTurnRun } from './flap-schedule';
import { dealOf, glyphToneOf, twinFaceAt, twinFacesOf, twinOf, twinPoseOf } from './greeting-twin';

const tenPerLetter = (face: string): number => face.length * 10;

const cellOf = (face: string, role: FlapCell['role'], accent = false): FlapCell => ({
  slot: face,
  face,
  kind: role === 'value' ? 'digit' : 'word',
  role,
  accent,
  lead: '',
  trail: '',
});

const RATTLE: FlapTurnRun = {
  motion: 'flap',
  cell: 1,
  start: 55,
  end: 505,
  faces: [
    { kind: 'text', text: '' },
    { kind: 'deck', slot: 0 },
    { kind: 'deck', slot: 1 },
    { kind: 'text', text: 'Lena.' },
  ],
  flips: [
    { kind: 'face', at: 55, duration: 110 },
    { kind: 'face', at: 165, duration: 110 },
    { kind: 'final', at: 275, duration: 230 },
  ],
};

describe('dealOf', () => {
  const decks = { deck: ['GROSS', 'ELFERRAT'], nameDeck: ['HOCH', 'HOCH', 'HOCH'] };

  it.each([
    { role: 'name', nameDeck: decks.nameDeck, faces: ['HOCH', 'HOCH', 'HOCH'], ordered: true },
    { role: 'plain', nameDeck: decks.nameDeck, faces: ['GROSS'], ordered: false },
    { role: 'name', nameDeck: null, faces: ['GROSS'], ordered: false },
  ] as const)(
    'deals a $role cell from the right deck (name deck $nameDeck)',
    ({ role, nameDeck, faces, ordered }) => {
      expect(
        dealOf(cellOf('Lena.', role), 60, { deck: decks.deck, nameDeck }, tenPerLetter),
      ).toEqual({ faces, ordered });
    },
  );
});

describe('twinFacesOf', () => {
  it('lands on the final text after the dealt faces', () => {
    const faces = twinFacesOf(RATTLE, { faces: ['HOCH', 'HOCH', 'HOCH'], ordered: true }, 11);

    expect(faces).toEqual(['', 'HOCH', 'HOCH', 'Lena.']);
  });

  it('deals seeded faces from a plain deck', () => {
    const faces = twinFacesOf(RATTLE, { faces: ['GROSS', 'ORDEN', 'BÜTT'], ordered: false }, 11);

    expect(faces.slice(1, 3).every((face) => ['GROSS', 'ORDEN', 'BÜTT'].includes(face))).toBe(true);
  });
});

describe('glyphToneOf', () => {
  it.each([
    { cell: cellOf('40', 'value', true), tone: 'gold', glyph: 'accent' },
    { cell: cellOf('Gerd!', 'name'), tone: 'gold', glyph: 'gold' },
    { cell: cellOf('Gerd!', 'name'), tone: 'ink', glyph: 'ink' },
    { cell: cellOf('Alles', 'plain'), tone: 'gold', glyph: 'ink' },
  ] as const)('lands $cell.face as $glyph on $tone tiles', ({ cell, tone, glyph }) => {
    expect(glyphToneOf(cell, tone)).toBe(glyph);
  });
});

describe('twinOf', () => {
  const schedule: FlapSchedule = {
    runs: [RATTLE, { motion: 'fade', cell: 0, start: 0, end: 240 }],
    tone: 'gold',
    line: null,
    burstAt: null,
    duration: 505,
  };
  const cells = [cellOf('70', 'value', true), cellOf('Lena.', 'name')];
  const box = { left: 10, top: 0, width: 60, height: 35 };

  it('boards only the turning cells it could measure', () => {
    const twin = twinOf('arrival', schedule, cells, { boxes: [box, box], deals: [] }, 11);

    expect(twin.cells.map((cell) => [cell.key, cell.glyph])).toEqual([['arrival:1', 'gold']]);
    expect(twin.tone).toBe('gold');
  });

  it('leaves a cell it could not measure to the ink', () => {
    expect(twinOf('arrival', schedule, cells, { boxes: [box, null], deals: [] }, 11).cells).toEqual(
      [],
    );
  });
});

describe('twinPoseOf', () => {
  it.each([
    { fall: 0, reveal: 0, fallen: false },
    { fall: -60, reveal: 0.5, fallen: false },
    { fall: -90, reveal: 1, fallen: true },
  ])(
    'reveals $reveal of the next face behind a leaf at $fall degrees',
    ({ fall, reveal, fallen }) => {
      const pose = twinPoseOf(fall, 90, 0);

      expect(pose.reveal).toBeCloseTo(reveal);
      expect(pose.fallen).toBe(fallen);
    },
  );
});

describe('twinFaceAt', () => {
  const faces = ['', 'GROSS', 'ORDEN', 'Lena.'];

  it.each([
    { index: 0, ahead: 0, face: '' },
    { index: 0.5, ahead: 1, face: 'GROSS' },
    { index: 1.999, ahead: 0, face: 'GROSS' },
    { index: 2, ahead: 1, face: 'Lena.' },
    { index: 3, ahead: 1, face: 'Lena.' },
  ])('shows $face for face index $index, $ahead ahead', ({ index, ahead, face }) => {
    expect(twinFaceAt(faces, index, ahead)).toBe(face);
  });
});
