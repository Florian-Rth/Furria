import { describe, expect, it } from 'vitest';
import { advanceTrail } from './screen-trail';

const ROOTS = ['/', '/club', '/more'];
const trailOf = (...paths: string[]) => ({ paths, move: 'still' }) as const;

describe('advanceTrail', () => {
  it('holds still when the screen has not changed', () => {
    expect(advanceTrail(trailOf('/club'), '/club', ROOTS).move).toBe('still');
  });

  it('moves forward when a later section is chosen', () => {
    expect(advanceTrail(trailOf('/'), '/more', ROOTS).move).toBe('lateral-forward');
  });

  it('moves back when an earlier section is chosen', () => {
    expect(advanceTrail(trailOf('/more'), '/', ROOTS).move).toBe('lateral-back');
  });

  it('crosses sideways to another section even from inside a drill-down', () => {
    expect(advanceTrail(trailOf('/club', '/members'), '/more', ROOTS)).toEqual({
      paths: ['/more'],
      move: 'lateral-forward',
    });
  });

  it('climbs out to the section it started in rather than crossing sideways', () => {
    expect(advanceTrail(trailOf('/club', '/members'), '/club', ROOTS)).toEqual({
      paths: ['/club'],
      move: 'shallower',
    });
  });

  it('goes deeper into a screen that is not a section root', () => {
    expect(advanceTrail(trailOf('/club'), '/members', ROOTS)).toEqual({
      paths: ['/club', '/members'],
      move: 'deeper',
    });
  });

  it('drops everything below the screen that was returned to', () => {
    const deep = trailOf('/club', '/members', '/members/3');

    expect(advanceTrail(deep, '/members', ROOTS)).toEqual({
      paths: ['/club', '/members'],
      move: 'shallower',
    });
  });

  it('starts still on the very first screen it ever sees', () => {
    expect(advanceTrail({ paths: [], move: 'still' }, '/club', ROOTS)).toEqual({
      paths: ['/club'],
      move: 'still',
    });
  });
});
