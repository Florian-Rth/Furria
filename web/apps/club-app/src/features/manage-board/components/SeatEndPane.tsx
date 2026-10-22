import { KkAlert } from '@furria/ui/KkAlert';
import { KkButton } from '@furria/ui/KkButton';
import type { KkDateQuickChoice } from '@furria/ui/KkDateField';
import { KkDateField } from '@furria/ui/KkDateField';
import { KkNote } from '@furria/ui/KkNote';
import { KkSeatLine } from '@furria/ui/KkSeatLine';
import { KkSeatList } from '@furria/ui/KkSeatList';
import { KkStepPane } from '@furria/ui/KkStepPane';
import type { FC } from 'react';
import { toAvatarHonours } from '@/lib/honours';
import { toInitials } from '@/lib/initials';
import { seatPhaseOf } from '../board-hub';
import {
  END_HINT,
  END_LABEL,
  END_SEAT_TITLE,
  SUBMIT_END,
  TODAY_CHOICE,
  toSeatPeriod,
} from '../board-hub-copy';
import { useSeatEnding } from '../hooks/use-seat-ending';
import { toPersonName } from '../manage-board-labels';
import type { BoardOffice, BoardSeat } from '../schemas';
import { SeatPaneHead } from './SeatPaneHead';

interface SeatEndPaneProps {
  office: BoardOffice;
  seat: BoardSeat;
  today: string;
  framed: boolean;
  onClose: () => void;
}

export const SeatEndPane: FC<SeatEndPaneProps> = ({ office, seat, today, framed, onClose }) => {
  const control = useSeatEnding(office, seat, today, onClose);
  const quickChoices: KkDateQuickChoice[] = [{ label: TODAY_CHOICE, value: today }];
  const consequence =
    control.consequence === null ? null : <KkNote tone="info">{control.consequence}</KkNote>;
  const rejection =
    control.rejection === null ? null : <KkAlert severity="error">{control.rejection}</KkAlert>;
  const period = toSeatPeriod(seat, seatPhaseOf(seat, today));
  const initials = toInitials(seat.firstName, seat.lastName);
  const honours = toAvatarHonours(seat.honours);
  const name = toPersonName(seat);

  return (
    <KkStepPane label={END_SEAT_TITLE} framed={framed}>
      <SeatPaneHead office={office} task={END_SEAT_TITLE} closable={framed} onClose={onClose} />
      <KkStepPane.Body>
        <KkSeatList label={END_SEAT_TITLE}>
          <KkSeatLine initials={initials} honours={honours} name={name} period={period} />
        </KkSeatList>
        <KkDateField
          name="endedOn"
          label={END_LABEL}
          value={control.endedOn}
          onChange={control.setEndedOn}
          quickChoices={quickChoices}
          required
          error={control.endedOnError !== undefined}
          helperText={control.endedOnError}
          hint={END_HINT}
        />
        {consequence}
        {rejection}
      </KkStepPane.Body>
      <KkStepPane.Foot>
        <KkButton
          variant="contained"
          tone="danger"
          fullWidth
          loading={control.isSaving}
          onClick={control.submit}
        >
          {SUBMIT_END}
        </KkButton>
      </KkStepPane.Foot>
    </KkStepPane>
  );
};
