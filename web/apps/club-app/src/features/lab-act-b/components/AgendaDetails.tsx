import { KkFactStrip } from '@furria/ui/KkFactStrip';
import { KkHubRow } from '@furria/ui/KkHubRow';
import { KkNote } from '@furria/ui/KkNote';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { ActCoEditorsSection } from '@/features/acts/components/ActCoEditorsSection';
import { ActWishChips } from '@/features/acts/components/ActWishChips';
import type { ActStudioResponse } from '@/features/acts/schemas';
import {
  DETAILS_FACTS_LABEL,
  DETAILS_LINKS_TITLE,
  DETAILS_WISHES_EMPTY,
  DETAILS_WISHES_TITLE,
  EDIT_STUDIO_LABEL,
  EDIT_STUDIO_META,
  EVENINGS_LINK_LABEL,
  EVENINGS_LINK_META,
} from '../agenda-copy';
import { useAgendaDetails } from '../hooks/use-agenda-details';

interface AgendaDetailsProps {
  data: ActStudioResponse;
  viewerId: number | null;
}

export const AgendaDetails: FC<AgendaDetailsProps> = ({ data, viewerId }) => {
  const details = useAgendaDetails(data, viewerId);
  const facts = details.facts.map((fact) => (
    <KkFactStrip.Fact key={fact.key} label={fact.label} value={fact.value} icon={fact.icon} />
  ));
  const wishes =
    data.act.wishes.length === 0 ? (
      <KkNote>{DETAILS_WISHES_EMPTY}</KkNote>
    ) : (
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, minWidth: 0 }}>
        <ActWishChips wishes={data.act.wishes} />
      </Stack>
    );
  const studioRow = data.viewer.canEditStudio ? (
    <KkHubRow
      label={EDIT_STUDIO_LABEL}
      icon="music"
      meta={EDIT_STUDIO_META}
      component={Link}
      to={details.studioTo}
      search={details.studioSearch}
    />
  ) : null;
  const coEditors = data.studio === null ? null : <ActCoEditorsSection page={data} />;

  return (
    <Stack sx={{ gap: 2.5, minWidth: 0 }}>
      <KkFactStrip label={DETAILS_FACTS_LABEL}>{facts}</KkFactStrip>
      <KkPanelSection title={DETAILS_WISHES_TITLE}>{wishes}</KkPanelSection>
      {coEditors}
      <KkPanelSection title={DETAILS_LINKS_TITLE}>
        <KkPanel>
          {studioRow}
          <KkHubRow
            label={EVENINGS_LINK_LABEL}
            icon="calendar"
            meta={EVENINGS_LINK_META}
            component={Link}
            to={details.studioTo}
            search={details.eveningsSearch}
          />
        </KkPanel>
      </KkPanelSection>
    </Stack>
  );
};
