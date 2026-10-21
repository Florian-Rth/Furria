import { KkMeta } from '@furria/ui';
import type { FC } from 'react';

interface RoleRosterBriefProps {
  description: string;
}

export const RoleRosterBrief: FC<RoleRosterBriefProps> = ({ description }) => {
  if (description === '') {
    return null;
  }

  return (
    <KkMeta component="span" lines={2}>
      {description}
    </KkMeta>
  );
};
