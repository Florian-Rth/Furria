import { describe, expect, it } from 'vitest';
import { toHistoryLines } from './intake-history';

describe('toHistoryLines', () => {
  it('shows the link expiry while the link is undecided', () => {
    const lines = toHistoryLines({
      intakeId: 1,
      state: 'open',
      label: null,
      newcomer: null,
      memberFrom: null,
      groups: [],
      startedBy: null,
      canManage: true,
      createdAt: '2026-11-10T10:00:00+00:00',
      expiresAt: '2026-11-17T10:00:00+00:00',
      submittedAt: null,
      completedAt: null,
      discardedAt: null,
    });

    expect(lines.map((line) => line.moment)).toEqual(['created', 'expires']);
  });

  it('drops the expiry and lists every moment once she is through', () => {
    const lines = toHistoryLines({
      intakeId: 1,
      state: 'completed',
      label: null,
      newcomer: null,
      memberFrom: null,
      groups: [],
      startedBy: null,
      canManage: true,
      createdAt: '2026-11-10T10:00:00+00:00',
      expiresAt: '2026-11-17T10:00:00+00:00',
      submittedAt: '2026-11-11T10:00:00+00:00',
      completedAt: '2026-11-12T10:00:00+00:00',
      discardedAt: null,
    });

    expect(lines.map((line) => line.moment)).toEqual(['created', 'submitted', 'completed']);
  });
});
