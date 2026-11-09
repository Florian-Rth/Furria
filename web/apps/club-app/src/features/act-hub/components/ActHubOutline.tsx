import { toImageSource } from '@furria/ui/image-source';
import type { KkCastTile } from '@furria/ui/KkCastGrid';
import { KkCastGrid } from '@furria/ui/KkCastGrid';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkPanelStack } from '@furria/ui/KkPanelStack';
import type { FC } from 'react';
import { CAST_LABEL, CAST_TITLE, toShortName } from '@/features/acts/acts-copy';
import type { ActStudioResponse } from '@/features/acts/schemas';
import { toInitials } from '@/lib/initials';

const IN_CAST_LABEL = 'dabei';

const ignoreToggle = (): void => {};

interface ActHubOutlineProps {
  data: ActStudioResponse;
}

export const ActHubOutline: FC<ActHubOutlineProps> = ({ data }) => {
  const tiles: KkCastTile[] = data.act.cast.map((person) => ({
    id: person.personId,
    name: toShortName(person.firstName, person.lastName),
    initials: toInitials(person.firstName, person.lastName),
    portrait: toImageSource(person.portrait, 'portrait'),
    state: 'person',
    badge: null,
    stateLabel: IN_CAST_LABEL,
  }));

  return (
    <KkPanelStack>
      <KkPanelSection title={CAST_TITLE}>
        <KkCastGrid label={CAST_LABEL} tiles={tiles} onToggle={ignoreToggle} readOnly />
      </KkPanelSection>
    </KkPanelStack>
  );
};
