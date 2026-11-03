import { DragDropProvider } from '@dnd-kit/react';
import { STUDIO_HOLDERS, STUDIO_HOLDERS_FREE } from '@furria/studio/studio-copy';
import { KkStudioList } from '@furria/ui/KkStudioList';
import type { FC } from 'react';
import { FREE_PLACE_ID, useActStudioHolders } from '../hooks/use-act-studio-holders';
import type { StudioScreen } from '../hooks/use-studio-screen';
import { ActStudioHolderChip } from './ActStudioHolderChip';
import { ActStudioHolderPlace } from './ActStudioHolderPlace';

interface ActStudioHolderSectionProps {
  screen: StudioScreen;
}

export const ActStudioHolderSection: FC<ActStudioHolderSectionProps> = ({ screen }) => {
  const holders = useActStudioHolders(screen);
  const places = holders.places.map((place) => {
    const holder = place.holder === null ? null : <ActStudioHolderChip holder={place.holder} />;

    return (
      <ActStudioHolderPlace key={place.spotId} id={place.spotId} label={place.label} wide={false}>
        {holder}
      </ActStudioHolderPlace>
    );
  });
  const free = holders.free.map((holder) => (
    <ActStudioHolderChip key={holder.personId} holder={holder} />
  ));

  return (
    <DragDropProvider plugins={holders.dragPlugins} onDragEnd={holders.onDragEnd}>
      <KkStudioList.Head text={STUDIO_HOLDERS} aside={null} />
      <KkStudioList.Places>
        {places}
        <ActStudioHolderPlace id={FREE_PLACE_ID} label={STUDIO_HOLDERS_FREE} wide>
          {free}
        </ActStudioHolderPlace>
      </KkStudioList.Places>
    </DragDropProvider>
  );
};
