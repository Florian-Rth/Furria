import { describe, expect, it } from 'vitest';
import { registerActiveLeaveGuard, requestActiveLeave } from './active-guard';

describe('requestActiveLeave', () => {
  it('returns false when no write screen is mounted', () => {
    expect(requestActiveLeave()).toBe(false);
  });

  it('delegates to the mounted write screen while it is registered', () => {
    const unregister = registerActiveLeaveGuard({ requestLeave: () => true });

    expect(requestActiveLeave()).toBe(true);

    unregister();

    expect(requestActiveLeave()).toBe(false);
  });

  it('lets a later registration replace an earlier one', () => {
    const unregisterFirst = registerActiveLeaveGuard({ requestLeave: () => true });
    const unregisterSecond = registerActiveLeaveGuard({ requestLeave: () => false });

    unregisterFirst();

    expect(requestActiveLeave()).toBe(false);

    unregisterSecond();
  });
});
