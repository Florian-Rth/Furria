import { KkHeading } from '@furria/ui/KkHeading';
import { KkInlineLink } from '@furria/ui/KkInlineLink';
import { KkMeta } from '@furria/ui/KkMeta';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { headerFactsOf } from '../act-card-copy';
import { groupHubLinkOf } from '../act-card-paths';
import type { ActCardView } from '../act-card-view';

interface ActCardHeaderProps {
  view: ActCardView;
}

export const ActCardHeader: FC<ActCardHeaderProps> = ({ view }) => {
  const shownGroup = view.groupNamed ? view.group : null;
  const sessionYear = view.seesDetails ? view.sessionYear : null;
  const facts = headerFactsOf(view.kind, sessionYear, shownGroup !== null);
  const group = shownGroup === null ? null : groupHubLinkOf(shownGroup.groupId);
  const groupLink =
    group === null || shownGroup === null ? null : (
      <KkInlineLink component={Link} to={group.to} params={group.params}>
        {shownGroup.name}
      </KkInlineLink>
    );

  return (
    <Stack component="header" sx={{ gap: 0.25, minWidth: 0 }}>
      <KkHeading level={2} component="h1">
        {view.name}
      </KkHeading>
      <KkMeta>
        {groupLink}
        {facts}
      </KkMeta>
    </Stack>
  );
};
