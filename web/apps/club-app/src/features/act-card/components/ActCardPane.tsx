import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { FC } from 'react';
import { toDoorLabel, toSheetTitle } from '../act-card-copy';
import type { DoorKey } from '../act-card-model';
import type { ActCardView } from '../act-card-view';
import { ActCardDoorContent } from './ActCardDoorContent';

interface ActCardPaneProps {
  view: ActCardView;
  door: DoorKey;
}

export const ActCardPane: FC<ActCardPaneProps> = ({ view, door }) => {
  const title = toSheetTitle(door, toDoorLabel(door, view.template, view.kind));

  return (
    <KkPanelSection title={title}>
      <ActCardDoorContent view={view} door={door} />
    </KkPanelSection>
  );
};
