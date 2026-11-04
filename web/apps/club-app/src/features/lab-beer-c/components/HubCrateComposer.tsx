import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkLedgerStepper } from '@furria/ui/KkLedgerStepper';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { HubPerson } from '../hooks/use-hub-person';
import { CRATE_ACTION, crateUnit, EMPTY_STOCK, LESS_LABEL, MORE_LABEL } from '../ledger-copy';

interface HubCrateComposerProps {
  person: HubPerson;
}

export const HubCrateComposer: FC<HubCrateComposerProps> = ({ person }) => {
  const unit = crateUnit(person.crateCount);
  const control =
    person.crateLimit === 0 ? (
      <KkText variant="caption" tone="secondary">
        {EMPTY_STOCK}
      </KkText>
    ) : (
      <KkLedgerStepper
        value={person.crateCount}
        min={1}
        max={person.crateLimit}
        unit={unit}
        lessLabel={LESS_LABEL}
        moreLabel={MORE_LABEL}
        onChange={person.setCrateCount}
      />
    );

  return (
    <Stack
      component="section"
      aria-label={CRATE_ACTION}
      direction="row"
      sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, minWidth: 0 }}
    >
      <KkEyebrow>{CRATE_ACTION}</KkEyebrow>
      {control}
    </Stack>
  );
};
