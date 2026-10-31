import { KkButton } from '@furria/ui/KkButton';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkNote } from '@furria/ui/KkNote';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { FC } from 'react';
import type { Studio } from '@/features/acts/schemas';
import { useChoreographyVersions } from '../hooks/use-choreography-versions';
import {
  VERSIONS_EMPTY,
  VERSIONS_FAILED,
  VERSIONS_NOTE,
  VERSIONS_OLDER,
  VERSIONS_OLDER_FAILED,
  VERSIONS_OLDER_RETRY,
} from '../undo-copy';
import { ChoreographyVersionRow } from './ChoreographyVersionRow';

interface ChoreographyVersionsSectionProps {
  actId: number;
  eventId: number | null;
  studio: Studio;
  title: string;
}

export const ChoreographyVersionsSection: FC<ChoreographyVersionsSectionProps> = ({
  actId,
  eventId,
  studio,
  title,
}) => {
  const versions = useChoreographyVersions(actId, eventId, studio);
  const rows = versions.rows.map((row) => (
    <ChoreographyVersionRow key={row.key} row={row} busy={versions.restoring} />
  ));
  const failed = versions.state === 'failed' ? <KkNote>{VERSIONS_FAILED}</KkNote> : null;
  const empty =
    versions.state === 'ready' && rows.length === 0 ? <KkNote>{VERSIONS_EMPTY}</KkNote> : null;
  const list = rows.length === 0 ? null : <KkPanel>{rows}</KkPanel>;
  const meta = <KkMeta>{String(versions.total)}</KkMeta>;
  const olderFailed = versions.olderFailed ? <KkNote>{VERSIONS_OLDER_FAILED}</KkNote> : null;
  const olderLabel = versions.olderFailed ? VERSIONS_OLDER_RETRY : VERSIONS_OLDER;
  const older = versions.hasOlder ? (
    <KkButton
      variant="outlined"
      fullWidth
      loading={versions.loadingOlder}
      onClick={versions.loadOlder}
    >
      {olderLabel}
    </KkButton>
  ) : null;

  return (
    <KkPanelSection title={title} meta={meta} description={VERSIONS_NOTE}>
      {failed}
      {empty}
      {list}
      {olderFailed}
      {older}
    </KkPanelSection>
  );
};
