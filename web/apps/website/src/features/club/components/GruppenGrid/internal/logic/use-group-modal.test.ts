import { describe, expect, it } from 'vitest';
import { resolveModalTransition } from './use-group-modal';

describe('resolveModalTransition', () => {
  it('collapses to an instant transition when reduced motion is preferred', () => {
    expect(resolveModalTransition(true)).toEqual({ duration: 0 });
  });

  it('uses a spring when motion is allowed', () => {
    expect(resolveModalTransition(false)).toMatchObject({ type: 'spring' });
  });

  it('treats an unknown preference as motion-allowed', () => {
    expect(resolveModalTransition(null)).toMatchObject({ type: 'spring' });
  });
});
