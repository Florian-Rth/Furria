import { KkHeading } from '@furria/ui/KkHeading';
import { KkInlineLink } from '@furria/ui/KkInlineLink';
import { KkMeta } from '@furria/ui/KkMeta';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { headerFactsOf } from '../act-c-copy';
import type { ActCView } from '../act-c-view';
import { labGroupOriginOf } from '../lab-act-c-paths';

interface ActCHeaderProps {
  view: ActCView;
}

export const ActCHeader: FC<ActCHeaderProps> = ({ view }) => {
  const facts = headerFactsOf(view.kind, view.sessionYear, view.group !== null);
  const group = view.group === null ? null : labGroupOriginOf(view.group.groupId, view.group.name);
  const groupLink =
    group === null ? null : (
      <KkInlineLink component={Link} to={group.to} params={group.params}>
        {group.label}
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
