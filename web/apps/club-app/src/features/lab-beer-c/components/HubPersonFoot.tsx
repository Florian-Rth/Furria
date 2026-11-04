import { KkAlert } from '@furria/ui/KkAlert';
import { KkButton } from '@furria/ui/KkButton';
import { KkIcon } from '@furria/ui/KkIcon';
import { KkStickyFoot } from '@furria/ui/KkStickyFoot';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { euroOf } from '@/features/lab-beer/beer-lab-ledger';
import type { HubPerson } from '../hooks/use-hub-person';
import {
  CANCEL,
  CRATE_ACTION,
  crateForConfirm,
  END_ACTION,
  PAY_ACTION,
  paymentConfirm,
} from '../ledger-copy';

const ICON_SX = { width: '1.125rem', height: '1.125rem' } as const;

interface HubPersonFootProps {
  person: HubPerson;
  firstName: string;
}

export const HubPersonFoot: FC<HubPersonFootProps> = ({ person, firstName }) => {
  const refusal =
    person.refusal === null ? null : <KkAlert severity="warning">{person.refusal}</KkAlert>;
  const cancel = (
    <KkButton variant="text" size="small" onClick={person.cancel}>
      {CANCEL}
    </KkButton>
  );

  if (person.composer === 'payment') {
    const label = paymentConfirm(person.payCount, euroOf(person.settlement.cents));

    return (
      <KkStickyFoot>
        {refusal}
        <KkButton
          variant="contained"
          fullWidth
          startIcon={<KkIcon name="check" sx={ICON_SX} />}
          onClick={person.confirmPayment}
        >
          {label}
        </KkButton>
        {cancel}
      </KkStickyFoot>
    );
  }

  if (person.composer === 'crate') {
    const label = crateForConfirm(person.crateCount, firstName);
    const blocked = person.crateLimit === 0;

    return (
      <KkStickyFoot>
        {refusal}
        <KkButton
          variant="contained"
          fullWidth
          disabled={blocked}
          startIcon={<KkIcon name="add" sx={ICON_SX} />}
          onClick={person.confirmCrate}
        >
          {label}
        </KkButton>
        {cancel}
      </KkStickyFoot>
    );
  }

  const nothingOpen = person.tab.openCount === 0;
  const end = person.enrolled ? (
    <KkButton variant="text" size="small" tone="danger" onClick={person.askEnd}>
      {END_ACTION}
    </KkButton>
  ) : null;

  return (
    <KkStickyFoot>
      {refusal}
      <KkButton
        variant="contained"
        fullWidth
        disabled={nothingOpen}
        startIcon={<KkIcon name="fees" sx={ICON_SX} />}
        onClick={person.startPayment}
      >
        {PAY_ACTION}
      </KkButton>
      <Stack direction="row" sx={{ justifyContent: 'center', gap: 2 }}>
        <KkButton variant="text" size="small" onClick={person.startCrate}>
          {CRATE_ACTION}
        </KkButton>
        {end}
      </Stack>
    </KkStickyFoot>
  );
};
