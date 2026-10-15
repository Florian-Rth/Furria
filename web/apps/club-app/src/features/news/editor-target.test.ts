import { describe, expect, it } from 'vitest';
import type { EditorTarget } from './editor-target';
import { editorTargetOf } from './editor-target';

describe('editorTargetOf', () => {
  it.each<{ label: string; routePostId: string; target: EditorTarget }>([
    { label: 'the new-post address', routePostId: 'neu', target: { kind: 'new' } },
    { label: 'a positive id', routePostId: '42', target: { kind: 'post', postId: 42 } },
    { label: 'zero', routePostId: '0', target: { kind: 'invalid' } },
    { label: 'a negative id', routePostId: '-3', target: { kind: 'invalid' } },
    { label: 'a fraction', routePostId: '1.5', target: { kind: 'invalid' } },
    { label: 'a word', routePostId: 'abc', target: { kind: 'invalid' } },
    { label: 'an empty segment', routePostId: '', target: { kind: 'invalid' } },
    { label: 'an exponent', routePostId: '1e3', target: { kind: 'invalid' } },
    {
      label: 'an id beyond safe integers',
      routePostId: '99999999999999999999',
      target: { kind: 'invalid' },
    },
  ])('reads $label', ({ routePostId, target }) => {
    expect(editorTargetOf(routePostId)).toEqual(target);
  });
});
