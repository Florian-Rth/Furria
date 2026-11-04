import { KkButton } from '@furria/ui/KkButton';
import { KkPourCountPicker } from '@furria/ui/KkPourCountPicker';
import { KkSelectField } from '@furria/ui/KkSelectField';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import type { PourHub } from '../hooks/use-pour-hub';
import { usePourPersonPick } from '../hooks/use-pour-person-pick';
import {
  COUNT_FIELD_LABEL,
  crateButtonOf,
  nameOf,
  PERSON_LABEL,
  personOptionLabelOf,
  stockAfterOf,
} from '../pour-hub-copy';
import { maxCountOf } from '../pour-member';
import { countsOf } from '../pour-member-copy';
import { PourFormFrame } from './PourFormFrame';

interface PourCratePaneProps {
  hub: PourHub;
  initialPersonId: number | null;
  framed: boolean;
  actions: ReactNode;
}

export const PourCratePane: FC<PourCratePaneProps> = ({
  hub,
  initialPersonId,
  framed,
  actions,
}) => {
  const enrolled = hub.roster.filter((row) => row.enrolled);
  const pick = usePourPersonPick(
    initialPersonId,
    enrolled.map((row) => row.personId),
  );
  const options = enrolled.map((row) => ({
    value: String(row.personId),
    label: personOptionLabelOf(row),
  }));
  const maxCount = maxCountOf(hub.summary.stock);
  const count = Math.max(1, Math.min(pick.count, maxCount));
  const counts = countsOf(maxCount);
  const personId = pick.personId;
  const buttonLabel = crateButtonOf(count, personId === null ? '…' : nameOf(personId));
  const stockAfter = stockAfterOf(hub.summary.stock, -count);
  const book = (): void => {
    if (personId !== null && hub.crate(personId, count)) {
      hub.closeSide();
    }
  };

  return (
    <PourFormFrame form="crate" framed={framed} actions={actions} refusal={hub.refusal}>
      <KkSelectField
        name="person"
        label={PERSON_LABEL}
        value={pick.value}
        options={options}
        presentation="select"
        onChange={pick.choose}
      />
      <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center' }}>
        <KkPourCountPicker
          label={COUNT_FIELD_LABEL}
          counts={counts}
          value={count}
          onChange={pick.setCount}
        />
        <KkText variant="caption" tone="secondary">
          {stockAfter}
        </KkText>
      </Stack>
      <KkButton
        variant="contained"
        size="large"
        disabled={personId === null || maxCount === 0}
        onClick={book}
      >
        {buttonLabel}
      </KkButton>
    </PourFormFrame>
  );
};
