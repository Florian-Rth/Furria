import type { KkStepState } from '@furria/ui/step-state';
import type { FC } from 'react';
import type { BeerTabState } from '../beer-hub';
import { useBeerHubContext } from '../beer-hub-context';
import { fullNameOf, personContextOf, personStateLabelOf } from '../beer-hub-copy';
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
  const context = personContextOf(pane.row);
  const stateLabel = personStateLabelOf(pane.row);
  const title = fullNameOf(pane.person);
  const state = PANE_STATES[pane.row?.state ?? 'paid'];
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
