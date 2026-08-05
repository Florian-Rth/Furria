import type { FC } from 'react';
import { BackLink } from '@/components/BackLink';
import { albumBackLinkLabel } from '@/features/gallery/gallery-content';

export const AlbumBackLink: FC = () => <BackLink to="/gallery">{albumBackLinkLabel}</BackLink>;
