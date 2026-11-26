import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

export interface GalleryHelpViewer {
  sorts: boolean;
  manages: boolean;
  publishes: boolean;
}

export const useGalleryHelpViewer = (sorts: boolean): GalleryHelpViewer => {
  const { has } = usePermissions();

  return {
    sorts,
    manages: has(PERMISSION_KEYS.galleryManage),
    publishes: has(PERMISSION_KEYS.galleryPublish),
  };
};
