import { toImageSource } from '@furria/ui/image-source';
import { KkFactStrip } from '@furria/ui/KkFactStrip';
import type { KkPassDetailsName } from '@furria/ui/KkPassDetails';
import { KkPassDetails } from '@furria/ui/KkPassDetails';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { actFactsOf, studioFactsOf, toCoEditorSince } from '@/features/acts/act-page-copy';
import { studioOverviewOf } from '@/features/acts/act-studio';
import { ActWishChips } from '@/features/acts/components/ActWishChips';
import type { ActStudioResponse, CoEditor } from '@/features/acts/schemas';
import { toInitials } from '@/lib/initials';
import {
  CLOSE_LABEL,
  CO_EDITORS_LABEL,
  DETAILS_LABEL,
  NONE,
  SESSION_LABEL,
  STATS_LABEL,
  toScheduleFacts,
  WISHES_LABEL,
} from '../pass-copy';
import { scheduleCountsOf } from '../pass-details';

interface PassDetailsProps {
  data: ActStudioResponse;
  viewerId: number | null;
  framed: boolean;
  onClose?: () => void;
}

const toName = (editor: CoEditor): KkPassDetailsName => ({
  id: editor.personId,
  name: `${editor.firstName} ${editor.lastName}`,
  initials: toInitials(editor.firstName, editor.lastName),
  portrait: toImageSource(editor.portrait, 'portrait'),
  meta: toCoEditorSince(editor.grantedAt),
});

export const PassDetails: FC<PassDetailsProps> = ({ data, viewerId, framed, onClose }) => {
  const studioFacts =
    data.studio === null ? [] : studioFactsOf(studioOverviewOf(data.studio, viewerId));
  const scheduleFacts = data.studio === null ? [] : toScheduleFacts(scheduleCountsOf(data.studio));
  const stats = [...studioFacts, ...scheduleFacts].map((fact) => (
    <KkFactStrip.Fact key={fact.key} label={fact.label} value={fact.value} icon={fact.icon} />
  ));
  const session = actFactsOf(data.act).map((fact) => (
    <KkFactStrip.Fact key={fact.key} label={fact.label} value={fact.value} icon={fact.icon} />
  ));
  const statsGroup =
    stats.length === 0 ? null : (
      <KkPassDetails.Group label={STATS_LABEL}>
        <KkFactStrip label={STATS_LABEL}>{stats}</KkFactStrip>
      </KkPassDetails.Group>
    );
  const coEditorsEmpty = data.coEditors.length === 0 ? NONE : undefined;
  const wishesEmpty = data.act.wishes.length === 0 ? NONE : undefined;

  return (
    <KkPassDetails label={DETAILS_LABEL} framed={framed}>
      <KkPassDetails.Head
        title={DETAILS_LABEL}
        context={data.act.name}
        closeLabel={CLOSE_LABEL}
        onClose={onClose}
      />
      {statsGroup}
      <KkPassDetails.Group label={CO_EDITORS_LABEL} empty={coEditorsEmpty}>
        <KkPassDetails.Names names={data.coEditors.map(toName)} />
      </KkPassDetails.Group>
      <KkPassDetails.Group label={WISHES_LABEL} empty={wishesEmpty}>
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
          <ActWishChips wishes={data.act.wishes} />
        </Stack>
      </KkPassDetails.Group>
      <KkPassDetails.Group label={SESSION_LABEL}>
        <KkFactStrip label={SESSION_LABEL}>{session}</KkFactStrip>
      </KkPassDetails.Group>
    </KkPassDetails>
  );
};
