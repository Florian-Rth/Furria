import { KkFacetGrid } from '@furria/ui/KkFacetGrid';
import { KkFacetList } from '@furria/ui/KkFacetList';
import { KkHeading } from '@furria/ui/KkHeading';
import { KkMeta } from '@furria/ui/KkMeta';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toActKindLabel } from '@/features/running-order/running-order-copy';
import {
  GROUP_ACTS_TITLE,
  HUB_EMPTY,
  HUB_REST_META,
  HUB_REST_TITLE,
  OTHER_ACTS_TITLE,
} from '../act-c-copy';
import type { ActCGroupView } from '../hooks/use-act-c-group';
import { groupHubLinkOf, labActLinkOf } from '../lab-act-c-paths';
import { ActCGroupHeader } from './ActCGroupHeader';
import { ActCHubActTile } from './ActCHubActTile';

const REST_LABEL = 'Mehr zur Gruppe';

interface ActCGroupBodyProps {
  view: ActCGroupView;
}

export const ActCGroupBody: FC<ActCGroupBodyProps> = ({ view }) => {
  const rest = groupHubLinkOf(view.hub.groupId);
  const cells = view.cards.map((card, order) => (
    <KkFacetGrid.Cell key={card.act.actId} reach="wide">
      <ActCHubActTile card={card} viewerId={view.viewerId} order={order} />
    </KkFacetGrid.Cell>
  ));
  const otherRows = view.others.map((act) => {
    const link = labActLinkOf(act.actId);
    const meta = act.kind === null ? undefined : toActKindLabel(act.kind);

    return (
      <KkFacetList.Row
        key={act.actId}
        title={act.name}
        meta={meta}
        component={Link}
        to={link.to}
        params={link.params}
      />
    );
  });
  const mineBlock =
    cells.length === 0 ? <KkMeta>{HUB_EMPTY}</KkMeta> : <KkFacetGrid>{cells}</KkFacetGrid>;
  const othersBlock =
    otherRows.length === 0 ? null : (
      <Stack component="section" sx={{ gap: 0.5, minWidth: 0 }}>
        <KkHeading level={4} component="h2">
          {OTHER_ACTS_TITLE}
        </KkHeading>
        <KkFacetList label={OTHER_ACTS_TITLE}>{otherRows}</KkFacetList>
      </Stack>
    );

  return (
    <Stack sx={{ gap: 2.5, minWidth: 0 }}>
      <ActCGroupHeader hub={view.hub} />
      <Stack component="section" sx={{ gap: 1, minWidth: 0 }}>
        <KkHeading level={4} component="h2">
          {GROUP_ACTS_TITLE}
        </KkHeading>
        {mineBlock}
      </Stack>
      {othersBlock}
      <KkFacetList label={REST_LABEL}>
        <KkFacetList.Row
          title={HUB_REST_TITLE}
          meta={HUB_REST_META}
          component={Link}
          to={rest.to}
          params={rest.params}
        />
      </KkFacetList>
    </Stack>
  );
};
