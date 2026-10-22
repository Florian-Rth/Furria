import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { GALLERY_ORIGIN, GALLERY_TITLE } from '@/features/session/app-sections';
import { AlbumMissing } from './AlbumMissing';

export const AlbumMissingScreen: FC = () => (
  <KkScreen kind="list" title={GALLERY_TITLE} origin={GALLERY_ORIGIN}>
    <AlbumMissing />
  </KkScreen>
);
