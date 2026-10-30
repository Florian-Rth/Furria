import type { KkListCheck } from '@furria/ui/KkNumberedList';
import { KkNumberedList } from '@furria/ui/KkNumberedList';
import type { FC } from 'react';
import { actLineKeyOf } from '@/features/running-order/running-order-review';
import type { CatalogueAct } from '@/features/running-order/schemas';
import type { CatalogueRowState } from '../planner-catalogue';
import { usePlanner } from '../planner-context';
import { ADD_LABEL, NEW_IN_EVENING, toPlaceNumber } from '../planner-copy';
import { PlannerLineFact } from './PlannerLineFact';
import { PlannerLineMark } from './PlannerLineMark';

interface PlannerCatalogueRowProps {
  act: CatalogueAct;
}

const checkOf = (state: CatalogueRowState): KkListCheck => {
  switch (state.kind) {
    case 'off':
      return { checked: false, note: null };
    case 'placed':
      return { checked: true, note: toPlaceNumber(state.place - 1) };
    case 'new':
      return { checked: true, note: NEW_IN_EVENING };
  }
};

export const PlannerCatalogueRow: FC<PlannerCatalogueRowProps> = ({ act }) => {
  const planner = usePlanner();
  const check = checkOf(planner.rowStateOf(act.actId));
  const toggle = (): void => {
    planner.toggle(act.actId);
  };

  return (
    <KkNumberedList.Row
      rowKey={actLineKeyOf(act.actId)}
      mark={<PlannerLineMark act={act} />}
      title={act.name}
      fact={<PlannerLineFact act={act} cast={act.cast} withGroup={false} archived={act.archived} />}
      check={check}
      openLabel={ADD_LABEL}
      onOpen={toggle}
    />
  );
};
