import { useDevelopingPicture } from '@/lib/media/use-developing-picture';
import type { SessionRecordSummary } from '../schemas';
import { developingLogosOf } from '../session-logo-draft';

const LOGO_CHANGES = ['sessionRecord'] as const;
const NO_RECORDS: readonly SessionRecordSummary[] = [];

export const useDevelopingSessionLogos = (
  records: readonly SessionRecordSummary[] | undefined,
  refresh: () => void,
): void => {
  const developing = developingLogosOf((records ?? NO_RECORDS).map((record) => record.logo));

  useDevelopingPicture({
    isDeveloping: developing.isDeveloping,
    isStalled: developing.isStalled,
    refresh,
    changes: LOGO_CHANGES,
  });
};
