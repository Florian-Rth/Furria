import { describe, expect, it } from 'vitest';
import { daySeedOf, deckFacesOf, deckForCell, orderedFacesOf, seededOrderOf } from './deck-fit';

const tenPerLetter = (face: string): number => face.length * 10;

describe('deckForCell', () => {
  it.each([
    { width: 50, deck: ['GROSS', 'FURRIA', 'ORDEN', 'BÜTT'], fitting: ['GROSS', 'ORDEN', 'BÜTT'] },
    { width: 40, deck: ['GROSS', 'BÜTT'], fitting: ['BÜTT'] },
    { width: 80, deck: ['HOCH', 'HOCH'], fitting: ['HOCH', 'HOCH'] },
  ])('keeps the faces no wider than a $width px cell', ({ width, deck, fitting }) => {
    expect(deckForCell(width, deck, tenPerLetter)).toEqual(fitting);
  });

  it('measures and shows the faces in capitals', () => {
    expect(deckForCell(60, ['besen'], tenPerLetter)).toEqual(['BESEN']);
  });

  it.each([
    { width: 20, deck: ['GROSS', 'FURRIA'] },
    { width: 80, deck: [] },
  ])('rattles single letters when no face fits a $width px cell', ({ width, deck }) => {
    const faces = deckForCell(width, deck, tenPerLetter);

    expect(faces.length).toBeGreaterThan(1);
    expect(faces.every((face) => /^[A-Z]$/.test(face))).toBe(true);
  });
});

describe('daySeedOf', () => {
  it('stays the same through a day', () => {
    expect(daySeedOf(new Date(2027, 0, 19, 0, 5))).toBe(daySeedOf(new Date(2027, 0, 19, 23, 55)));
  });

  it.each([
    [new Date(2027, 0, 19), new Date(2027, 0, 20)],
    [new Date(2027, 0, 31), new Date(2027, 1, 1)],
    [new Date(2026, 11, 31), new Date(2027, 0, 1)],
  ])('changes from %s to the next day', (day, next) => {
    expect(daySeedOf(next)).not.toBe(daySeedOf(day));
  });
});

describe('seededOrderOf', () => {
  it('shuffles the deck without losing or adding a face', () => {
    const deck = ['GROSS', 'FURRIA', 'ELFERRAT', 'GARDE', 'ORDEN'];

    expect([...seededOrderOf(deck, 7)].sort()).toEqual([...deck].sort());
  });

  it('orders the deck differently on another day', () => {
    const deck = ['GROSS', 'FURRIA', 'ELFERRAT', 'GARDE', 'ORDEN', 'BÜTT', 'KAPPE', 'BESEN'];

    expect(seededOrderOf(deck, 1)).not.toEqual(seededOrderOf(deck, 2));
  });
});

describe('deckFacesOf', () => {
  const deck = ['GROSS', 'FURRIA', 'ELFERRAT', 'GARDE', 'ORDEN', 'BÜTT'];

  it.each([1, 2, 3])('deals %d faces from the deck', (count) => {
    const faces = deckFacesOf(deck, 11, 0, count);

    expect(faces).toHaveLength(count);
    expect(faces.every((face) => deck.includes(face))).toBe(true);
  });

  it('opens neighbouring cells on different faces', () => {
    expect(deckFacesOf(deck, 11, 0, 1)).not.toEqual(deckFacesOf(deck, 11, 1, 1));
  });

  it('deals nothing from an empty deck', () => {
    expect(deckFacesOf([], 11, 0, 3)).toEqual([]);
  });
});

describe('orderedFacesOf', () => {
  it.each([
    { deck: ['HOCH', 'HOCH', 'HOCH'], count: 2, faces: ['HOCH', 'HOCH'] },
    { deck: ['DIENSTAG', 'MONTAG'], count: 3, faces: ['DIENSTAG', 'MONTAG', 'DIENSTAG'] },
    { deck: [], count: 2, faces: [] },
  ])('deals $count faces in deck order', ({ deck, count, faces }) => {
    expect(orderedFacesOf(deck, count)).toEqual(faces);
  });
});
