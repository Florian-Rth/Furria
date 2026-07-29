import { KkSection } from '@furria/ui';
import type { FC } from 'react';
import type { AlbumSessionGroup } from '@/features/gallery/gallery-content';
import { olderSessionsHeading } from '@/features/gallery/gallery-content';
import { OlderSessionRowList } from './internal/layout/OlderSessionRowList';
import { useExpandedSession } from './internal/logic/use-expanded-session';
import { OlderSessionEntry } from './internal/ui/OlderSessionEntry';

interface OlderSessionsProps {
  groups: AlbumSessionGroup[];
}

export const OlderSessions: FC<OlderSessionsProps> = ({ groups }) => {
  const { expandedStartYear, collapseTimeout, toggle } = useExpandedSession();

  if (groups.length === 0) {
    return null;
  }

  return (
    <KkSection>
      <KkSection.Header title={olderSessionsHeading} />
      <OlderSessionRowList>
        {groups.map((group) => (
          <OlderSessionEntry
            key={group.session.startYear}
            group={group}
            expandedStartYear={expandedStartYear}
            collapseTimeout={collapseTimeout}
            onToggle={toggle}
          />
        ))}
      </OlderSessionRowList>
    </KkSection>
  );
};
