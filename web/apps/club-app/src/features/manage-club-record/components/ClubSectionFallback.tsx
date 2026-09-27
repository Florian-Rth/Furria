import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { RequirePermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import type { ClubRecordSection } from '../club-record-labels';
import { CLUB_RECORD_ORIGIN, CLUB_RECORD_SECTION_TITLES } from '../club-record-labels';
import type { ClubSectionGate } from '../hooks/use-club-section-gate';
import { ClubRecordError } from './ClubRecordError';
import { ClubSectionSkeleton } from './ClubSectionSkeleton';

interface ClubSectionFallbackProps {
  section: ClubRecordSection;
  gate: ClubSectionGate;
}

export const ClubSectionFallback: FC<ClubSectionFallbackProps> = ({ section, gate }) => {
  const content =
    gate.errorMessage === null ? (
      <ClubSectionSkeleton />
    ) : (
      <ClubRecordError message={gate.errorMessage} onRetry={gate.reload} />
    );

  return (
    <KkScreen
      kind="fullscreen"
      title={CLUB_RECORD_SECTION_TITLES[section]}
      origin={CLUB_RECORD_ORIGIN}
    >
      <RequirePermission permissionKey={PERMISSION_KEYS.clubManage}>{content}</RequirePermission>
    </KkScreen>
  );
};
