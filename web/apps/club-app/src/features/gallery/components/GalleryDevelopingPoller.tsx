import type { FC } from 'react';
import { useDevelopingItems } from '../api';

export const GalleryDevelopingPoller: FC = () => {
  useDevelopingItems();
  return null;
};
