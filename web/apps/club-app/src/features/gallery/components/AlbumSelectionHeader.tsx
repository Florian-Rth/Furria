import { KkScreenHeader } from '@furria/ui/KkScreenHeader';
import type { FC } from 'react';
import { SELECTION_TITLE } from '../gallery-copy';
import { AlbumSelectionMarquee } from './AlbumSelectionMarquee';

interface AlbumSelectionHeaderProps {
  isPublished: boolean;
  hangKey: number;
  lead: string;
}

export const AlbumSelectionHeader: FC<AlbumSelectionHeaderProps> = ({
  isPublished,
  hangKey,
  lead,
}) => (
  <KkScreenHeader>
    <KkScreenHeader.Text>
      <KkScreenHeader.Title>{SELECTION_TITLE}</KkScreenHeader.Title>
      <AlbumSelectionMarquee isPublished={isPublished} hangKey={hangKey} lead={lead} />
    </KkScreenHeader.Text>
  </KkScreenHeader>
);
