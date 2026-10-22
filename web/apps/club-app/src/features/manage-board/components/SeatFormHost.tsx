import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import { KkMasterDetail } from '@furria/ui/KkMasterDetail';
import type { FC } from 'react';
import { CLOSE_LABEL, OPEN_SEAT_TITLE } from '../board-hub-copy';
import type { SeatFormTarget } from '../hooks/use-seat-form-target';
import type { BoardOffice } from '../schemas';
import { SeatFormPane } from './SeatFormPane';

const PANE_SPAN = 5;

interface SeatFormHostProps {
  target: SeatFormTarget | null;
  offices: readonly BoardOffice[];
  isWide: boolean;
  today: string;
  onClose: () => void;
}

export const SeatFormHost: FC<SeatFormHostProps> = ({
  target,
  offices,
  isWide,
  today,
  onClose,
}) => {
  if (target === null) {
    return null;
  }

  if (isWide) {
    return (
      <KkMasterDetail.Detail span={PANE_SPAN}>
        <SeatFormPane target={target} offices={offices} today={today} framed onClose={onClose} />
      </KkMasterDetail.Detail>
    );
  }

  return (
    <KkBottomDrawer open label={OPEN_SEAT_TITLE} closeLabel={CLOSE_LABEL} onClose={onClose}>
      <SeatFormPane
        target={target}
        offices={offices}
        today={today}
        framed={false}
        onClose={onClose}
      />
    </KkBottomDrawer>
  );
};
