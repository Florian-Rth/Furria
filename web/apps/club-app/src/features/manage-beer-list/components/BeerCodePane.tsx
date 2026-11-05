import { KkButton } from '@furria/ui/KkButton';
import { KkLedgerPrintSheet } from '@furria/ui/KkLedgerPrintSheet';
import type { FC } from 'react';
import {
  CODE_LEAD,
  CODE_SHEET_LEAD,
  CODE_SHEET_TITLE,
  CODE_TITLE,
  HUB_TITLE,
  PRINT_LABEL,
} from '../beer-hub-copy';
import { beerBookingUrlOf } from '../beer-landing';
import { BeerPaneFrame } from './BeerPaneFrame';
import { BeerSettingsSwitch } from './BeerSettingsSwitch';

const print = (): void => {
  window.print();
};

const SWITCHER = <BeerSettingsSwitch value="/beer-list/manage/code" />;

export const BeerCodePane: FC = () => {
  const value = beerBookingUrlOf(window.location.origin);
  const lines = [CODE_SHEET_LEAD];

  return (
    <BeerPaneFrame switcher={SWITCHER} icon="qr" title={CODE_TITLE} context={CODE_LEAD}>
      <KkLedgerPrintSheet
        value={value}
        qrLabel={CODE_TITLE}
        eyebrow={HUB_TITLE}
        title={CODE_SHEET_TITLE}
        lines={lines}
      />
      <KkButton variant="contained" size="large" onClick={print}>
        {PRINT_LABEL}
      </KkButton>
    </BeerPaneFrame>
  );
};
