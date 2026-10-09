import type { UploadTally } from './upload-queue';
import { remainingMinutesOf } from './upload-queue';

export type UploadStatus =
  | { kind: 'empty' }
  | { kind: 'paused'; sent: number; total: number; share: number }
  | {
      kind: 'running';
      sent: number;
      total: number;
      share: number;
      minutes: number | null;
      streams: number;
    }
  | { kind: 'finished'; sent: number; total: number };

export const uploadStatusOf = (
  tally: UploadTally,
  paused: boolean,
  bytesPerSecond: number,
): UploadStatus => {
  if (tally.total === 0) {
    return { kind: 'empty' };
  }
  const share = tally.bytesTotal === 0 ? 0 : tally.bytesSent / tally.bytesTotal;
  if (tally.active === 0) {
    return { kind: 'finished', sent: tally.sent, total: tally.total };
  }
  if (paused) {
    return { kind: 'paused', sent: tally.sent, total: tally.total, share };
  }
  return {
    kind: 'running',
    sent: tally.sent,
    total: tally.total,
    share,
    minutes: remainingMinutesOf(tally.bytesTotal - tally.bytesSent, bytesPerSecond),
    streams: tally.streaming,
  };
};
