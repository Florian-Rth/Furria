import { KkNote } from '@furria/ui/KkNote';
import type { FC } from 'react';
import { ARCHIVED_NOTE, CURRENT_TITLE, PLANNED_TITLE } from '../board-hub-copy';
import type { OfficePaneControl } from '../hooks/use-office-pane';
import { OfficeSeatGroup } from './OfficeSeatGroup';

interface OfficeSeatsTabProps {
  today: string;
  control: OfficePaneControl;
  onEnd: (boardSeatId: number) => void;
}

export const OfficeSeatsTab: FC<OfficeSeatsTabProps> = ({ today, control, onEnd }) => {
  if (control.isArchived) {
    return <KkNote>{ARCHIVED_NOTE}</KkNote>;
  }

  return (
    <>
      <OfficeSeatGroup
        title={CURRENT_TITLE}
        seats={control.groups.current}
        emptyNote={control.vacantFact}
        today={today}
        canEnd={control.canSeat}
        onEnd={onEnd}
      />
      <OfficeSeatGroup
        title={PLANNED_TITLE}
        seats={control.groups.planned}
        today={today}
        canEnd={false}
        onEnd={onEnd}
      />
    </>
  );
};
