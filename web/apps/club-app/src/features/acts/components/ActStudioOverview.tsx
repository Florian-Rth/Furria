import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkFactStrip } from '@furria/ui/KkFactStrip';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  NO_MUSIC_LINE,
  NO_MUSIC_TITLE,
  STUDIO_FACTS_LABEL,
  STUDIO_TITLE,
  studioFactsOf,
} from '../act-page-copy';
import { studioOverviewOf } from '../act-studio';
import type { Studio } from '../schemas';

interface ActStudioOverviewProps {
  studio: Studio;
  viewerId: number | null;
}

export const ActStudioOverview: FC<ActStudioOverviewProps> = ({ studio, viewerId }) => {
  const overview = studioOverviewOf(studio, viewerId);
  const facts = studioFactsOf(overview).map((fact) => (
    <KkFactStrip.Fact key={fact.key} label={fact.label} value={fact.value} icon={fact.icon} />
  ));
  const noMusic = overview.hasMusic ? null : (
    <KkPanel variant="block">
      <KkEmptyState size="panel" title={NO_MUSIC_TITLE} description={NO_MUSIC_LINE} />
    </KkPanel>
  );

  return (
    <KkPanelSection title={STUDIO_TITLE}>
      <Stack sx={{ gap: 1.5, minWidth: 0 }}>
        {noMusic}
        <KkFactStrip label={STUDIO_FACTS_LABEL}>{facts}</KkFactStrip>
      </Stack>
    </KkPanelSection>
  );
};
