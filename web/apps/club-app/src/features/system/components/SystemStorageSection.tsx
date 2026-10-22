import { KkFillGauge } from '@furria/ui/KkFillGauge';
import { KkReadout } from '@furria/ui/KkReadout';
import type { FC } from 'react';
import type { SystemStatus } from '../schemas';
import { SECTION_TITLES, STORAGE_LABEL, STORAGE_UNMEASURED } from '../system-copy';
import { storageViewOf } from '../system-view';

interface SystemStorageSectionProps {
  status: SystemStatus;
  nowMs: number;
  dimmed: boolean;
}

export const SystemStorageSection: FC<SystemStorageSectionProps> = ({ status, nowMs, dimmed }) => {
  const storage = storageViewOf(status, nowMs);
  const isEmpty = storage.parts.length === 0 && storage.free === null;
  const gauge = isEmpty ? (
    <KkReadout.Note text={STORAGE_UNMEASURED} level="attention" />
  ) : (
    <KkFillGauge
      label={STORAGE_LABEL}
      parts={storage.parts}
      other={storage.other}
      free={storage.free}
      totalBytes={storage.totalBytes}
    />
  );

  return (
    <KkReadout label={SECTION_TITLES.storage} aside={storage.measured} dimmed={dimmed}>
      {gauge}
    </KkReadout>
  );
};
