import { KkOfficeMark } from '@furria/ui/KkOfficeMark';
import { KkRoster } from '@furria/ui/KkRoster';
import type { FC } from 'react';
import { toLandingKey } from '@/features/write/landing-target';
import { OFFICE_LANDING_KIND } from '../board-hub';
import { OPEN_OFFICE_LABEL, toArchivedSinceLabel } from '../board-hub-copy';
import type { BoardOffice } from '../schemas';

interface BoardArchivedLineProps {
  office: BoardOffice;
  archivedOn: string;
  selected: boolean;
  highlightedKey: string | null;
  compact: boolean;
  onOpen: (boardOfficeId: number) => void;
}

export const BoardArchivedLine: FC<BoardArchivedLineProps> = ({
  office,
  archivedOn,
  selected,
  highlightedKey,
  compact,
  onOpen,
}) => {
  const landing = toLandingKey(OFFICE_LANDING_KIND, office.boardOfficeId);
  const open = (): void => {
    onOpen(office.boardOfficeId);
  };
  const mark = <KkOfficeMark icon={office.icon} state="archived" />;
  const archived = toArchivedSinceLabel(archivedOn);
  const flags = <KkRoster.Flag icon="archive" label={archived} text={archived} />;

  return (
    <KkRoster.Line
      mark={mark}
      name={office.name}
      flags={flags}
      openLabel={OPEN_OFFICE_LABEL}
      selected={selected}
      landing={landing}
      highlight={highlightedKey === landing}
      dimmed
      compact={compact}
      onOpen={open}
    />
  );
};
