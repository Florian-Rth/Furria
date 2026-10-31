import { KkChip } from '@furria/ui/KkChip';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkSessionRow } from '@furria/ui/KkSessionRow';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { HistorySession } from '../act-history';
import { toEmptySessionNote, toPhaseChip, toSessionSeason } from '../acts-copy';
import { GroupActsSessionRow } from './GroupActsSessionRow';

interface GroupActsSessionProps {
  groupId: number;
  session: HistorySession;
}

export const GroupActsSession: FC<GroupActsSessionProps> = ({ groupId, session }) => {
  const phase = toPhaseChip(session.phase);
  const chip =
    phase === null ? null : (
      <KkChip tone={phase.tone} dot size="small">
        {phase.label}
      </KkChip>
    );
  const rows = session.acts.map((act) => (
    <GroupActsSessionRow key={act.actId} groupId={groupId} act={act} />
  ));
  const season = toSessionSeason(session.sessionYear);
  const emptyNote = toEmptySessionNote(session.phase);
  const content = rows.length === 0 ? <KkMeta>{emptyNote}</KkMeta> : <Stack>{rows}</Stack>;

  return (
    <KkSessionRow>
      <KkSessionRow.Body>
        <KkSessionRow.Heading>
          <KkSessionRow.Season>{season}</KkSessionRow.Season>
          {chip}
        </KkSessionRow.Heading>
        {content}
      </KkSessionRow.Body>
    </KkSessionRow>
  );
};
