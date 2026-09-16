import { describe, expect, it } from 'vitest';
import { toSessionThread } from './session-thread';

describe('toSessionThread', () => {
  it('carries the running Session as a quiet thread', () => {
    const thread = toSessionThread(new Date(2026, 0, 1));

    expect(thread?.tone).toBe('neutral');
    expect(thread?.value).toBeGreaterThan(0);
    expect(thread?.value).toBeLessThan(1);
  });

  it('names the Session it is measuring', () => {
    expect(toSessionThread(new Date(2026, 0, 1))?.label).toContain('2025/26');
  });

  it('declares no thread while no Session is running', () => {
    expect(toSessionThread(new Date(2026, 6, 21))).toBeUndefined();
  });
});
