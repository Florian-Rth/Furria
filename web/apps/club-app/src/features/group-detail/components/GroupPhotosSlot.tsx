import { KkPanelSection, KkReservedSlot } from '@furria/ui';
import type { FC } from 'react';
import { GROUP_SECTION_TITLES, PHOTOS_RESERVED, RESERVED_BADGE } from '@/lib/group-sections';

export const GroupPhotosSlot: FC = () => (
  <KkPanelSection title={GROUP_SECTION_TITLES.photos}>
    <KkReservedSlot
      icon="gallery"
      title={PHOTOS_RESERVED.title}
      description={PHOTOS_RESERVED.description}
      badge={RESERVED_BADGE}
    />
  </KkPanelSection>
);
