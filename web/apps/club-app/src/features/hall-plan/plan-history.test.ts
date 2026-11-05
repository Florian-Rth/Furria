import { describe, expect, it } from 'vitest';
import { commit, createHistory, endCoalescing, redo, undo } from './plan-history';

describe('plan history', () => {
  it('undoes and redoes commits in order', () => {
    const history = commit(commit(createHistory('a'), 'b'), 'c');
    const undone = undo(undo(history));

    expect(undone.present).toBe('a');
    expect(redo(undone).present).toBe('b');
  });

  it('coalesces commits with the same key into one undo step', () => {
    const dragged = commit(
      commit(commit(createHistory('a'), 'b', 'drag'), 'c', 'drag'),
      'd',
      'drag',
    );

    expect(dragged.present).toBe('d');
    expect(undo(dragged).present).toBe('a');
  });

  it('starts a new step after coalescing ends', () => {
    const history = commit(endCoalescing(commit(createHistory('a'), 'b', 'drag')), 'c', 'drag');

    expect(undo(history).present).toBe('b');
  });

  it('drops the redo branch on a new commit', () => {
    const history = commit(undo(commit(createHistory('a'), 'b')), 'c');

    expect(redo(history).present).toBe('c');
  });

  it('keeps only the newest steps within the limit', () => {
    const history = commit(
      commit(commit(createHistory('a'), 'b', null, 2), 'c', null, 2),
      'd',
      null,
      2,
    );

    expect(history.past).toEqual(['b', 'c']);
  });

  it.each([
    ['undo', undo<string>],
    ['redo', redo<string>],
  ])('%s without steps changes nothing', (_name, step) => {
    const history = createHistory('a');

    expect(step(history)).toBe(history);
  });
});
