import type { PushDelivery } from './schemas';

export type TestPushReport = 'no-device' | 'unreached' | 'partly-reached' | 'reached';

export const testPushReportOf = ({
  delivered,
  forgotten,
  failed,
}: PushDelivery): TestPushReport => {
  if (delivered + forgotten + failed === 0) {
    return 'no-device';
  }
  if (delivered === 0) {
    return 'unreached';
  }

  return failed > 0 ? 'partly-reached' : 'reached';
};
