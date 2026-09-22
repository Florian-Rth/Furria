import type { KkPanelAction } from '@furria/ui';
import { KkPanel, KkPanelSection } from '@furria/ui';
import Grid from '@mui/material/Grid';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toLandingKey } from '@/features/write';
import {
  CREATE_GROUP_KIND_LABEL,
  CREATE_GROUP_KIND_PILL_LABEL,
  GROUP_KINDS_PANEL_TITLE,
  toGroupKindEntries,
  toGroupKindsIntro,
} from '../manage-groups-labels';
import type { ManagedGroupKind } from '../schemas';
import { GroupKindCard } from './GroupKindCard';
import { GroupKindsEmpty } from './GroupKindsEmpty';

const GRID_SPACING = { xs: 1.5, desktop: 2 };
const CARD_SIZE = { xs: 12, sm: 6, desktop: 4 };
const CARD_SLOT = { minWidth: 0 } as const;
const GRID = { minWidth: 0 } as const;
const NEW_GROUP_KIND_ROUTE = '/manage/groups/kinds/new';

interface GroupKindsPanelProps {
  kinds: readonly ManagedGroupKind[];
  highlightedKey: string | null;
}

export const GroupKindsPanel: FC<GroupKindsPanelProps> = ({ kinds, highlightedKey }) => {
  const entries = toGroupKindEntries(kinds);

  const cards = entries.map((entry) => (
    <Grid key={entry.groupKindId} size={CARD_SIZE} sx={CARD_SLOT}>
      <GroupKindCard
        entry={entry}
        highlight={highlightedKey === toLandingKey('group-kind', entry.groupKindId)}
      />
    </Grid>
  ));

  const body =
    entries.length === 0 ? (
      <KkPanel variant="block">
        <GroupKindsEmpty />
      </KkPanel>
    ) : (
      <Grid container spacing={GRID_SPACING} sx={GRID}>
        {cards}
      </Grid>
    );

  const action: KkPanelAction = {
    label: CREATE_GROUP_KIND_PILL_LABEL,
    icon: 'add',
    ariaLabel: CREATE_GROUP_KIND_LABEL,
    component: Link,
    to: NEW_GROUP_KIND_ROUTE,
  };

  return (
    <KkPanelSection
      title={GROUP_KINDS_PANEL_TITLE}
      meta={toGroupKindsIntro(entries)}
      action={action}
    >
      {body}
    </KkPanelSection>
  );
};
