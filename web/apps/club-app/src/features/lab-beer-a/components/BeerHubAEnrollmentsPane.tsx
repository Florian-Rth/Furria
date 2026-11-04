import { KkConfirmDialog } from '@furria/ui/KkConfirmDialog';
import { KkTabLedger } from '@furria/ui/KkTabLedger';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useState } from 'react';
import type { LabBeerRefusal } from '@/features/lab-beer/beer-lab-actions';
import { labBeerPersonOf } from '@/features/lab-beer/beer-lab-fixture';
import { euroOf, tabOf } from '@/features/lab-beer/beer-lab-ledger';
import type { LabBeerWorld } from '@/features/lab-beer/beer-lab-types';
import {
  ENDED_HEAD,
  ENROLLED_HEAD,
  ENROLLMENTS_PANE,
  endConfirm,
  openFact,
  peopleCount,
} from '../beer-a-copy';
import { nameOf, shortDayOf } from '../beer-a-format';
import { BeerHubAEnrollmentRow } from './BeerHubAEnrollmentRow';

const NO_FACTS = [] as const;

interface BeerHubAEnrollmentsPaneProps {
  world: LabBeerWorld;
  end: (personId: number) => LabBeerRefusal | null;
}

export const BeerHubAEnrollmentsPane: FC<BeerHubAEnrollmentsPaneProps> = ({ world, end }) => {
  const [target, setTarget] = useState<number | null>(null);
  const openCentsOf = (personId: number): number =>
    tabOf(personId, world.crates, world.payments).openCents;
  const active = world.enrollments
    .filter((enrollment) => enrollment.endedAt === null)
    .sort((left, right) =>
      nameOf(labBeerPersonOf(left.personId)).localeCompare(nameOf(labBeerPersonOf(right.personId))),
    );
  const ended = world.enrollments.filter((enrollment) => enrollment.endedAt !== null);
  const activeRows = active.map((enrollment) => {
    const cents = openCentsOf(enrollment.personId);

    return (
      <BeerHubAEnrollmentRow
        key={`active-${enrollment.personId}`}
        person={labBeerPersonOf(enrollment.personId)}
        personId={enrollment.personId}
        count={cents === 0 ? '' : openFact(euroOf(cents))}
        day={shortDayOf(enrollment.startedAt)}
        onEnd={setTarget}
      />
    );
  });
  const endedRows = ended.map((enrollment) => {
    const cents = openCentsOf(enrollment.personId);

    return (
      <BeerHubAEnrollmentRow
        key={`ended-${enrollment.personId}-${enrollment.endedAt ?? ''}`}
        person={labBeerPersonOf(enrollment.personId)}
        personId={enrollment.personId}
        count={cents === 0 ? '' : openFact(euroOf(cents))}
        day={shortDayOf(enrollment.endedAt ?? enrollment.startedAt)}
        onEnd={null}
      />
    );
  });
  const endedHead =
    endedRows.length === 0 ? null : (
      <KkTabLedger.Head key="ended" title={ENDED_HEAD} meta={peopleCount(endedRows.length)} />
    );
  const targetName = nameOf(target === null ? null : labBeerPersonOf(target));
  const confirm = endConfirm(targetName);
  const closeConfirm = (): void => {
    setTarget(null);
  };
  const confirmEnd = (): void => {
    if (target !== null) {
      end(target);
    }
    setTarget(null);
  };

  return (
    <Stack sx={{ gap: 1.5, minWidth: 0 }}>
      <KkTabLedger label={ENROLLMENTS_PANE}>
        <KkTabLedger.Head
          key="active"
          title={ENROLLED_HEAD}
          meta={peopleCount(activeRows.length)}
        />
        {activeRows}
        {endedHead}
        {endedRows}
      </KkTabLedger>
      <KkConfirmDialog
        open={target !== null}
        onClose={closeConfirm}
        onConfirm={confirmEnd}
        tone="danger"
        eyebrow={confirm.eyebrow}
        question={confirm.question}
        explanation={confirm.explanation}
        facts={NO_FACTS}
        confirmLabel={confirm.confirmLabel}
        cancelLabel={confirm.cancelLabel}
        closeLabel={confirm.closeLabel}
      />
    </Stack>
  );
};
