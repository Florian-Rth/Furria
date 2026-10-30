import { KkNumberedList } from '@furria/ui/KkNumberedList';
import type { FC } from 'react';
import type { DraftLine } from '@/features/running-order/types';
import { usePlanner } from '../planner-context';
import { OPEN_LABEL } from '../planner-copy';
import { placeNumberOf } from '../planner-rows';
import { PlannerLineFact } from './PlannerLineFact';
import { PlannerLineMark } from './PlannerLineMark';

interface PlannerRowDetailHeadProps {
  line: DraftLine;
}

export const PlannerRowDetailHead: FC<PlannerRowDetailHeadProps> = ({ line }) => {
  const planner = usePlanner();
  const act = line.act;
  const placeNumber = placeNumberOf(planner.draft, line.key);

  return (
    <KkNumberedList label={act.name}>
      <KkNumberedList.Row
        rowKey={`head:${line.key}`}
        number={placeNumber === null ? null : String(placeNumber)}
        pinned={line.pinned}
        mark={<PlannerLineMark act={act} />}
        title={act.name}
        fact={<PlannerLineFact act={act} cast={act.cast} eveningChanges={line.eveningChanges} />}
        arrive={false}
        openLabel={OPEN_LABEL}
      />
    </KkNumberedList>
  );
};
