import { KkBottomDrawer, KkIconButton, KkMasterDetail } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { CLOSE_LABEL, OFFICE_PATH, OPEN_PAGE_LABEL } from '../board-hub-copy';
import type { SeatFormTargetControl } from '../hooks/use-seat-form-target';
import type { BoardOffice } from '../schemas';
import { OfficePane } from './OfficePane';
import { SeatFormHost } from './SeatFormHost';

const PANE_SPAN = 5;

interface BoardSideProps {
  offices: readonly BoardOffice[];
  selected: BoardOffice | null;
  form: SeatFormTargetControl;
  isWide: boolean;
  today: string;
  canManageRoles: boolean;
  onClose: () => void;
}

export const BoardSide: FC<BoardSideProps> = ({
  offices,
  selected,
  form,
  isWide,
  today,
  canManageRoles,
  onClose,
}) => {
  if (form.target !== null || selected === null) {
    return (
      <SeatFormHost
        target={form.target}
        offices={offices}
        isWide={isWide}
        today={today}
        onClose={form.close}
      />
    );
  }

  const params = { boardOfficeId: String(selected.boardOfficeId) };
  const openPage = (
    <KkIconButton
      label={OPEN_PAGE_LABEL}
      icon="external"
      size="small"
      component={Link}
      to={OFFICE_PATH}
      params={params}
    />
  );

  if (!isWide) {
    return (
      <KkBottomDrawer open label={selected.name} closeLabel={CLOSE_LABEL} onClose={onClose}>
        <OfficePane
          key={selected.boardOfficeId}
          office={selected}
          today={today}
          canManageRoles={canManageRoles}
          framed={false}
          surface="paper"
          actions={openPage}
          onOpenSeat={form.openSeat}
          onEndSeat={form.endSeat}
        />
      </KkBottomDrawer>
    );
  }

  const actions = (
    <>
      {openPage}
      <KkIconButton label={CLOSE_LABEL} icon="close" size="small" onClick={onClose} />
    </>
  );

  return (
    <KkMasterDetail.Detail span={PANE_SPAN}>
      <OfficePane
        key={selected.boardOfficeId}
        office={selected}
        today={today}
        canManageRoles={canManageRoles}
        framed
        surface="paper"
        actions={actions}
        onOpenSeat={form.openSeat}
        onEndSeat={form.endSeat}
      />
    </KkMasterDetail.Detail>
  );
};
