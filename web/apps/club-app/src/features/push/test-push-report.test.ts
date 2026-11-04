import { describe, expect, it } from 'vitest';
import type { PushDelivery } from './schemas';
import type { TestPushReport } from './test-push-report';
import { testPushReportOf } from './test-push-report';

describe('testPushReportOf', () => {
  it.each<[string, PushDelivery, TestPushReport]>([
    ['no subscribed device', { delivered: 0, forgotten: 0, failed: 0 }, 'no-device'],
    ['only gone devices', { delivered: 0, forgotten: 2, failed: 0 }, 'unreached'],
    ['only failing devices', { delivered: 0, forgotten: 0, failed: 1 }, 'unreached'],
    ['a delivery beside a failure', { delivered: 1, forgotten: 0, failed: 1 }, 'partly-reached'],
    ['a delivery beside a gone device', { delivered: 1, forgotten: 1, failed: 0 }, 'reached'],
    ['every device reached', { delivered: 2, forgotten: 0, failed: 0 }, 'reached'],
  ])('reports %s', (_case, delivery, report) => {
    expect(testPushReportOf(delivery)).toBe(report);
  });
});
