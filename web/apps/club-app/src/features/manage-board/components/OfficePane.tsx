import { KkStepPane } from '@furria/ui/KkStepPane';
import type { KkStickyFootSurface } from '@furria/ui/KkStickyFoot';
import type { FC, ReactNode } from 'react';
import { useOfficePane } from '../hooks/use-office-pane';
import type { BoardOffice } from '../schemas';
import { ArchiveBoardOfficeDialog } from './ArchiveBoardOfficeDialog';
import { OfficePaneBody } from './OfficePaneBody';
import { OfficePaneFoot } from './OfficePaneFoot';
import { OfficePaneHead } from './OfficePaneHead';
import { OfficePaneTabs } from './OfficePaneTabs';
import { RestoreBoardOfficeDialog } from './RestoreBoardOfficeDialog';

interface OfficePaneProps {
  office: BoardOffice;
  today: string;
  canManageRoles: boolean;
  framed: boolean;
  surface: KkStickyFootSurface;
  actions?: ReactNode;
  onOpenSeat: (boardOfficeId: number, sinceOn: string) => void;
  onEndSeat: (boardOfficeId: number, boardSeatId: number) => void;
}

export const OfficePane: FC<OfficePaneProps> = ({
  office,
  today,
  canManageRoles,
  framed,
  surface,
  actions,
  onOpenSeat,
  onEndSeat,
}) => {
  const control = useOfficePane(office, today, canManageRoles);
  const end = (boardSeatId: number): void => {
    onEndSeat(office.boardOfficeId, boardSeatId);
  };
  const seat = (sinceOn: string): void => {
    onOpenSeat(office.boardOfficeId, sinceOn);
  };
  const head =
    surface === 'page' ? null : (
      <OfficePaneHead office={office} isVacant={control.isVacant} actions={actions} />
    );
  const archiveTarget = control.archiveOpen ? control.entry : null;
  const restoreTarget = control.restoreOpen ? control.entry : null;

  return (
    <KkStepPane label={office.name} framed={framed}>
      {head}
      <OfficePaneTabs
        tab={control.tab}
        needsWork={control.needsWork}
        isArchived={control.isArchived}
        onChoose={control.chooseTab}
      />
      <KkStepPane.Body>
        <OfficePaneBody
          office={office}
          today={today}
          control={control}
          onPage={surface === 'page'}
          onEnd={end}
        />
      </KkStepPane.Body>
      <OfficePaneFoot control={control} surface={surface} onSeat={seat} />
      <ArchiveBoardOfficeDialog office={archiveTarget} onClose={control.closeDialogs} />
      <RestoreBoardOfficeDialog office={restoreTarget} onClose={control.closeDialogs} />
    </KkStepPane>
  );
};
