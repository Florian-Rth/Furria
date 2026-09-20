import { KkChip, KkGroupToneChip } from '@furria/ui';
import type { FC } from 'react';
import type { TermineMark } from '../group-termine';

interface HubTermineMarkProps {
  mark: TermineMark;
}

export const HubTermineMark: FC<HubTermineMarkProps> = ({ mark }) => {
  if (mark === null) {
    return null;
  }
  if (mark.kind === 'running') {
    return (
      <KkChip tone="accent" size="small" dot live>
        {mark.label}
      </KkChip>
    );
  }
  if (mark.kind === 'guestOfClub') {
    return (
      <KkChip tone="gold" size="small">
        {mark.label}
      </KkChip>
    );
  }

  return <KkGroupToneChip tone={mark.tone}>{mark.label}</KkGroupToneChip>;
};
