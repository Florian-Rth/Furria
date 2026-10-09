import type { KkContactStripFrame } from '@furria/ui';
import { KkContactStrip } from '@furria/ui';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';
import { HUB_LOADING_LABEL } from '../hub-copy';

const LATENT_FRAMES: KkContactStripFrame[] = Array.from({ length: 8 }, (_, position) => ({
  id: `latent-${position}`,
  label: HUB_LOADING_LABEL,
}));
const STRIP_KEYS = ['first', 'second', 'third'] as const;
const ignore = (): void => undefined;

const LATENT_STRIPS = STRIP_KEYS.map((key) => (
  <KkContactStrip
    key={key}
    title=""
    titleLabel={HUB_LOADING_LABEL}
    frames={LATENT_FRAMES}
    onOpen={ignore}
  />
));

export const GalleryHubSkeleton: FC = () => (
  <AppSkeletonRegion label={HUB_LOADING_LABEL}>{LATENT_STRIPS}</AppSkeletonRegion>
);
