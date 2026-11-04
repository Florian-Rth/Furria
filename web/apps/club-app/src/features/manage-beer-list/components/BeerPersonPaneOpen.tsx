import type { KkStepState } from '@furria/ui/step-state';
import type { FC } from 'react';
import type { BeerTabState } from '../beer-hub';
import { useBeerHubContext } from '../beer-hub-context';
import { cratesLabel, daysLabel, euroOf, fullNameOf } from '../beer-hub-copy';
import type { BeerOpenHub } from '../hooks/use-beer-hub';
import { usePersonPane } from '../hooks/use-person-pane';
import { BeerPaneFrame } from './BeerPaneFrame';
import { BeerPersonBody } from './BeerPersonBody';

const PANE_STATES: Record<BeerTabState, KkStepState> = {
  overdue: 'overdue',
  open: 'current',
  paid: 'done',
};

interface BeerPersonPaneOpenProps {
  open: BeerOpenHub;
  personId: number;
}

export const BeerPersonPaneOpen: FC<BeerPersonPaneOpenProps> = ({ open, personId }) => {
  const hub = useBeerHubContext();
  const pane = usePersonPane(hub, open, personId);
  const row = pane.row;
  const openCrates = row?.openCrates ?? 0;
  const context =
    openCrates > 0
      ? `${cratesLabel(openCrates)} offen · ${daysLabel(row?.openDays ?? 0)}`
      : 'alles bezahlt';
  const stateLabel = openCrates > 0 ? `${euroOf(row?.openCents ?? 0)} offen` : 'bezahlt';
  const title = fullNameOf(pane.person);
  const state = PANE_STATES[row?.state ?? 'paid'];
  const body =
    pane.person === null ? null : <BeerPersonBody open={open} person={pane.person} pane={pane} />;

  return (
    <BeerPaneFrame
      icon="person"
      title={title}
      context={context}
      state={state}
      stateLabel={stateLabel}
    >
      {body}
    </BeerPaneFrame>
  );
};
