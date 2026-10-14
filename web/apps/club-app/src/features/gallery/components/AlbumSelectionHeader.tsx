import { KkScreenHeader } from '@furria/ui';
import type { FC } from 'react';
import { SELECTION_TITLE } from '../gallery-copy';
import { AlbumSelectionMarquee } from './AlbumSelectionMarquee';

interface AlbumSelectionHeaderProps {
  isPublished: boolean;
  hangKey: number;
  lead: string;
  meta: string;
}

export const AlbumSelectionHeader: FC<AlbumSelectionHeaderProps> = ({
  isPublished,
  hangKey,
  lead,
  meta,
}) => (
  <KkScreenHeader>
    <KkScreenHeader.Text>
      <KkScreenHeader.Title>{SELECTION_TITLE}</KkScreenHeader.Title>
      <AlbumSelectionMarquee isPublished={isPublished} hangKey={hangKey} lead={lead} meta={meta} />
    </KkScreenHeader.Text>
  </KkScreenHeader>
);
