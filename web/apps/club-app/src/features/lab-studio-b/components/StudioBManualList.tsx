import { KkStudioBManual } from '@furria/ui/KkStudioBManual';
import type { FC } from 'react';
import { useStudioB } from '../studio-b-context';
import { LATER_LINE, MANUAL_LABEL } from '../studio-b-copy';
import { manualEntriesOf } from '../studio-b-manual';
import { StudioBManualEntry } from './StudioBManualEntry';

interface StudioBManualListProps {
  cardInList: boolean;
}

export const StudioBManualList: FC<StudioBManualListProps> = ({ cardInList }) => {
  const { practice } = useStudioB();
  const currentId = practice.current?.stepId ?? null;
  const entries = manualEntriesOf(practice.manual, currentId, cardInList).map((entry) => (
    <StudioBManualEntry key={entry.key} entry={entry} />
  ));

  return (
    <KkStudioBManual label={MANUAL_LABEL}>
      {entries}
      <KkStudioBManual.Later key="later" text={LATER_LINE} />
    </KkStudioBManual>
  );
};
