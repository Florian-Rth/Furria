import { describe, expect, it } from 'vitest';
import type { KkGreetingPart } from './flap-cells';
import { boundCellOf, flapTextOf, previousFacesOf, toFlapCells } from './flap-cells';

const plain = (text: string): KkGreetingPart => ({ text, role: 'plain' });
const value = (text: string): KkGreetingPart => ({ text, role: 'value' });
const named = (text: string): KkGreetingPart => ({ text, role: 'name' });

describe('toFlapCells', () => {
  it('splits words on whitespace and values into one cell per character', () => {
    const cells = toFlapCells([
      plain('Day '),
      value('70'),
      plain(' of your '),
      value('12.'),
      plain(' season, '),
      named('Lena'),
      plain('.'),
    ]);

    expect(cells.map((cell) => [cell.face, cell.kind])).toEqual([
      ['Day', 'word'],
      ['7', 'digit'],
      ['0', 'digit'],
      ['of', 'word'],
      ['your', 'word'],
      ['1', 'digit'],
      ['2', 'digit'],
      ['.', 'mark'],
      ['season,', 'word'],
      ['Lena.', 'word'],
    ]);
  });

  it('marks only the first value part as the accent', () => {
    const cells = toFlapCells([value('70'), plain(' and '), value('12')]);

    expect(cells.map((cell) => cell.accent)).toEqual([true, true, false, false, false]);
  });

  it.each([
    { parts: [named('Lena'), plain(', still '), value('40')], face: 'Lena,', role: 'name' },
    { parts: [plain('Big '), plain('day!')], face: 'day!', role: 'plain' },
  ] as const)(
    'attaches punctuation to the word before it, giving $face',
    ({ parts, face, role }) => {
      const cells = toFlapCells(parts);

      expect(cells.find((cell) => cell.face === face)?.role).toBe(role);
    },
  );

  it.each([
    { kind: 'a colon', text: '10:59', kinds: ['digit', 'digit', 'mark', 'digit', 'digit'] },
    { kind: 'a dot', text: '33.', kinds: ['digit', 'digit', 'mark'] },
  ])('keeps $kind inside a value as a static mark cell', ({ text, kinds }) => {
    expect(toFlapCells([value(text)]).map((cell) => cell.kind)).toEqual(kinds);
  });

  it.each([[[plain('  Two  spaces  '), value('5'), plain(' ')]], [[plain('')]]])(
    'reassembles the exact text so the title holds the final string',
    (parts) => {
      expect(flapTextOf(toFlapCells(parts))).toBe(parts.map((part) => part.text).join(''));
    },
  );
});

describe('previousFacesOf', () => {
  const cellsOf = (text: string): ReturnType<typeof toFlapCells> =>
    toFlapCells([plain('Still '), value(text), plain(' to go.')]);

  it('pairs every cell with the face at the same place when the board kept its shape', () => {
    expect(previousFacesOf(cellsOf('40'), ['Still', '4', '1', 'to', 'go.'])).toEqual([
      'Still',
      '4',
      '1',
      'to',
      'go.',
    ]);
  });

  it('right-aligns a value that lost a digit', () => {
    expect(
      previousFacesOf(cellsOf('9:59'), ['Still', '1', '0', ':', '0', '0', 'to', 'go.']),
    ).toEqual(['Still', '0', ':', '0', '0', 'to', 'go.']);
  });

  it('leaves a new leading digit without a previous face', () => {
    expect(previousFacesOf(cellsOf('10:00'), ['Still', '9', ':', '5', '9', 'to', 'go.'])).toEqual([
      'Still',
      null,
      '9',
      ':',
      '5',
      '9',
      'to',
      'go.',
    ]);
  });

  it('has no previous faces without a remembered board', () => {
    expect(previousFacesOf(cellsOf('40'), null)).toEqual([null, null, null, null, null]);
  });
});

describe('boundCellOf', () => {
  const cells = toFlapCells([
    { text: 'Tag ', role: 'plain' },
    { text: '13.', role: 'value' },
    { text: ' Session, ', role: 'plain' },
    { text: 'Lena', role: 'name' },
    { text: '.', role: 'plain' },
  ]);

  it.each([
    { face: '.', bound: true },
    { face: '3', bound: false },
    { face: 'Tag', bound: false },
  ])('binds the cell $face to the digit before it: $bound', ({ face, bound }) => {
    const index = cells.findIndex((cell) => cell.face === face);

    expect(boundCellOf(cells, index)).toBe(bound ? index - 1 : null);
  });
});
