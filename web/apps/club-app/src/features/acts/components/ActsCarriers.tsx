import { toImageSource } from '@furria/ui/image-source';
import { KkButton } from '@furria/ui/KkButton';
import type { KkFaceToggle } from '@furria/ui/KkFaceToggles';
import { KkFaceToggles } from '@furria/ui/KkFaceToggles';
import { KkMeta } from '@furria/ui/KkMeta';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { PlannerDetailSection } from '@/features/running-order/components/PlannerDetailSection';
import { toInitials } from '@/lib/initials';
import {
  CARRIERS_LABEL,
  SPOTLIGHT_CLEAR_LABEL,
  SPOTLIGHT_PRESS_LABEL,
  toFullName,
  toShortName,
  toSpotlightLine,
} from '../acts-copy';
import type { ActsHub } from '../hooks/use-acts-hub';

interface ActsCarriersProps {
  hub: ActsHub;
}

export const ActsCarriers: FC<ActsCarriersProps> = ({ hub }) => {
  if (hub.carriers.length === 0) {
    return null;
  }

  const faces: KkFaceToggle[] = hub.carriers.map(({ person, actIds }) => ({
    id: person.personId,
    name: toShortName(person.firstName, person.lastName),
    initials: toInitials(person.firstName, person.lastName),
    portrait: toImageSource(person.portrait, 'portrait'),
    count: actIds.length,
  }));
  const spotlight = hub.spotlight;
  const spotlightLine =
    spotlight === null
      ? null
      : toSpotlightLine(
          toFullName(spotlight.person.firstName, spotlight.person.lastName),
          spotlight.actIds.length,
        );
  const spotlightRow =
    spotlight === null ? undefined : (
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, minWidth: 0 }}
      >
        <KkMeta>{spotlightLine}</KkMeta>
        <KkButton size="small" variant="text" onClick={hub.clearSpotlight}>
          {SPOTLIGHT_CLEAR_LABEL}
        </KkButton>
      </Stack>
    );

  return (
    <PlannerDetailSection title={CARRIERS_LABEL}>
      <KkFaceToggles
        label={CARRIERS_LABEL}
        faces={faces}
        selectedId={spotlight?.person.personId ?? null}
        pressLabel={SPOTLIGHT_PRESS_LABEL}
        layout="scroll"
        onToggle={hub.toggleSpotlight}
      />
      {spotlightRow}
    </PlannerDetailSection>
  );
};
