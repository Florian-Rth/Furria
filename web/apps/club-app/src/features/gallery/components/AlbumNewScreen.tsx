import { useSearch } from '@tanstack/react-router';
import type { FC } from 'react';
import { AlbumFormEditor } from './AlbumFormEditor';

const ROUTE_ID = '/_app/gallery_/new';

export const AlbumNewScreen: FC = () => {
  const { entry } = useSearch({ from: ROUTE_ID });
  const presetEntryId = entry ?? null;

  return <AlbumFormEditor album={null} presetEntryId={presetEntryId} />;
};
