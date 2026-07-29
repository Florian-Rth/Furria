import type { FC } from 'react';
import type { AlbumSessionGroup } from '@/features/gallery/gallery-content';
import { OlderSessionAlbumList } from '../layout/OlderSessionAlbumList';
import { OlderSessionPanel } from '../layout/OlderSessionPanel';
import { OlderSessionRow } from '../layout/OlderSessionRow';
import { buildOlderSessionPanelId, buildOlderSessionToggleId } from '../logic/use-expanded-session';
import { OlderSessionAlbumLink } from './OlderSessionAlbumLink';
import { OlderSessionToggle } from './OlderSessionToggle';

interface OlderSessionEntryProps {
  group: AlbumSessionGroup;
  expandedStartYear: number | null;
  collapseTimeout: number;
  onToggle: (startYear: number) => void;
}

export const OlderSessionEntry: FC<OlderSessionEntryProps> = ({
  group,
  expandedStartYear,
  collapseTimeout,
  onToggle,
}) => {
  const { startYear } = group.session;
  const expanded = startYear === expandedStartYear;
  const toggleId = buildOlderSessionToggleId(startYear);
  const panelId = buildOlderSessionPanelId(startYear);
  const handleToggle = (): void => onToggle(startYear);

  return (
    <OlderSessionRow>
      <OlderSessionToggle
        group={group}
        expanded={expanded}
        id={toggleId}
        panelId={panelId}
        onToggle={handleToggle}
      />
      <OlderSessionPanel
        id={panelId}
        labelledBy={toggleId}
        expanded={expanded}
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
};
