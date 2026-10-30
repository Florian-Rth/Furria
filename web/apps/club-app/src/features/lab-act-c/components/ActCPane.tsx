import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { FC } from 'react';
import { toDoorLabel, toSheetTitle } from '../act-c-copy';
import type { DoorKey } from '../act-c-model';
import type { ActCView } from '../act-c-view';
import { ActCDoorContent } from './ActCDoorContent';

interface ActCPaneProps {
  view: ActCView;
  door: DoorKey;
}

export const ActCPane: FC<ActCPaneProps> = ({ view, door }) => {
  const title = toSheetTitle(door, toDoorLabel(door, view.template, view.kind));

  return (
    <KkPanelSection title={title}>
      <ActCDoorContent view={view} door={door} />
    </KkPanelSection>
  );
};
