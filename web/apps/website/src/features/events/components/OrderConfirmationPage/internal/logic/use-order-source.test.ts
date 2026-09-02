import { describe, expect, it } from 'vitest';
import { DEMO_ORDER } from '@/lib/seed/orders';
import { resolveOrderSource } from './use-order-source';

describe('resolveOrderSource', () => {
  it('waits while the Bestellung is still on its way', () => {
    expect(resolveOrderSource(undefined, false)).toEqual({ status: 'loading' });
  });

  it('fails honestly once the code turned out to be unknown', () => {
    expect(resolveOrderSource(undefined, true)).toEqual({ status: 'error' });
  });

  it('shows the Bestellung even after a stale failure', () => {
    expect(resolveOrderSource(DEMO_ORDER, true)).toEqual({
      status: 'ready',
      order: DEMO_ORDER,
    });
  });
});
