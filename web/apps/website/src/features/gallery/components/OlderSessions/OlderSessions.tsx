import { KkSection } from '@furria/ui';
import type { FC } from 'react';
import type { AlbumSessionGroup } from '@/features/gallery/gallery-content';
import { olderSessionsHeading } from '@/features/gallery/gallery-content';
import { OlderSessionAlbumList } from './internal/layout/OlderSessionAlbumList';
import { OlderSessionPanel } from './internal/layout/OlderSessionPanel';
import { OlderSessionRow } from './internal/layout/OlderSessionRow';
import { OlderSessionRowList } from './internal/layout/OlderSessionRowList';
import {
  buildOlderSessionPanelId,
  buildOlderSessionToggleId,
  useExpandedSession,
} from './internal/logic/use-expanded-session';
import { OlderSessionAlbumLink } from './internal/ui/OlderSessionAlbumLink';
import { OlderSessionToggle } from './internal/ui/OlderSessionToggle';

interface OlderSessionsProps {
  groups: AlbumSessionGroup[];
}

export const OlderSessions: FC<OlderSessionsProps> = ({ groups }) => {
  const { expandedStartYear, collapseTimeout, toggle } = useExpandedSession();

  return (
    <KkSection>
      <KkSection.Header title={olderSessionsHeading} />
      <OlderSessionRowList>
        {groups.map((group) => {
          const { startYear } = group.session;
          const toggleId = buildOlderSessionToggleId(startYear);
          const panelId = buildOlderSessionPanelId(startYear);

          return (
            <OlderSessionRow key={startYear}>
              <OlderSessionToggle
                group={group}
                expanded={startYear === expandedStartYear}
                id={toggleId}
                panelId={panelId}
                onToggle={() => toggle(startYear)}
              />
              <OlderSessionPanel
                id={panelId}
                labelledBy={toggleId}
                expanded={startYear === expandedStartYear}
                timeout={collapseTimeout}
              >
                <OlderSessionAlbumList>
                  {group.albums.map((album) => (
                    <OlderSessionAlbumLink key={album.slug} album={album} />
                  ))}
                </OlderSessionAlbumList>
              </OlderSessionPanel>
            </OlderSessionRow>
          );
        })}
      </OlderSessionRowList>
    </KkSection>
  );
};
