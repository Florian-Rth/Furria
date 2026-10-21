import type { FC } from 'react';
import type { OfficePaneControl } from '../hooks/use-office-pane';
import type { BoardOffice } from '../schemas';
import { OfficeHistoryTab } from './OfficeHistoryTab';
import { OfficeSeatsTab } from './OfficeSeatsTab';
import { OfficeSettingsTab } from './OfficeSettingsTab';

interface OfficePaneBodyProps {
  office: BoardOffice;
  today: string;
  control: OfficePaneControl;
  onPage: boolean;
  onEnd: (boardSeatId: number) => void;
}

export const OfficePaneBody: FC<OfficePaneBodyProps> = ({
  office,
  today,
  control,
  onPage,
  onEnd,
}) => {
  switch (control.tab) {
    case 'seats':
      return <OfficeSeatsTab today={today} control={control} onEnd={onEnd} />;
    case 'history':
      return <OfficeHistoryTab office={office} today={today} />;
    case 'settings':
      return <OfficeSettingsTab office={office} control={control} onPage={onPage} />;
  }
};
