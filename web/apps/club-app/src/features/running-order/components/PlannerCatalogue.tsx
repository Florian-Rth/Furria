import { KkNumberedList } from '@furria/ui/KkNumberedList';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { usePlanner } from '../planner-context';
import { CATALOGUE_EMPTY, CATALOGUE_TITLE, POINTS_TITLE } from '../planner-copy';
import { PlannerActsLinks } from './PlannerActsLinks';
import { PlannerCatalogueRow } from './PlannerCatalogueRow';
import { PlannerPrevious } from './PlannerPrevious';

export const PlannerCatalogue: FC = () => {
  const planner = usePlanner();

  if (!planner.catalogueReady) {
    return null;
  }

  const sections = planner.catalogue.flatMap((section) => [
    <KkNumberedList.Section
      key={section.id}
      title={section.kind === 'group' ? section.group.name : POINTS_TITLE}
      tone={section.kind === 'group' ? section.group.tone : undefined}
    />,
    ...section.acts.map((act) => <PlannerCatalogueRow key={act.actId} act={act} />),
  ]);
  const empty =
    sections.length === 0 ? <KkNumberedList.Empty>{CATALOGUE_EMPTY}</KkNumberedList.Empty> : null;

  return (
    <Stack sx={{ gap: 1, minWidth: 0 }}>
      <PlannerPrevious />
      <KkNumberedList label={CATALOGUE_TITLE}>
        {sections}
        {empty}
      </KkNumberedList>
      <PlannerActsLinks />
    </Stack>
  );
};
