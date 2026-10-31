import { KkScreen } from '@furria/ui/KkScreen';
import { KkVisuallyHidden } from '@furria/ui/KkVisuallyHidden';
import type { KkScreenActions } from '@furria/ui/screen-declaration';
import type { FC } from 'react';
import { usePlannerAction } from '../hooks/use-planner-action';
import { useRunningOrderPlanner } from '../hooks/use-running-order-planner';
import { PlannerContext } from '../planner-context';
import { PAGE_TITLE, UNDO_LABEL } from '../planner-copy';
import { runningOrderOriginOf } from '../running-order-origin';
import { PlannerBody } from './PlannerBody';
import { PlannerFoot } from './PlannerFoot';
import { PlannerModeSwitch } from './PlannerModeSwitch';
import { PlannerPersonDrawer } from './PlannerPersonDrawer';
import { PlannerRowDrawer } from './PlannerRowDrawer';
import { PlannerWishesDrawer } from './PlannerWishesDrawer';

interface RunningOrderScreenProps {
  eventId: number;
}

export const RunningOrderScreen: FC<RunningOrderScreenProps> = ({ eventId }) => {
  const planner = useRunningOrderPlanner(eventId);
  const { foot: footView } = usePlannerAction(planner);
  const origin = runningOrderOriginOf(eventId, planner.event.data?.title);
  const actions: KkScreenActions | undefined = planner.store.canUndo
    ? [{ id: 'undo', label: UNDO_LABEL, icon: 'undo', onSelect: planner.store.undo }]
    : undefined;
  const ready = !planner.store.isLoading && planner.store.loadError === null;
  const tools = ready ? <PlannerModeSwitch /> : undefined;
  const foot = footView === null ? undefined : <PlannerFoot view={footView} />;

  return (
    <PlannerContext.Provider value={planner}>
      <KkScreen
        kind="working"
        title={PAGE_TITLE}
        origin={origin}
        actions={actions}
        tools={tools}
        foot={foot}
      >
        <KkVisuallyHidden component="h1">{PAGE_TITLE}</KkVisuallyHidden>
        <PlannerBody />
        <PlannerRowDrawer />
        <PlannerPersonDrawer />
        <PlannerWishesDrawer />
      </KkScreen>
    </PlannerContext.Provider>
  );
};
