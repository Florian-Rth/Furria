import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { PlaceholderPage } from '@/components/PlaceholderPage';

const GalleryComponent: FC = () => <PlaceholderPage title="Galerie" />;

export const Route = createFileRoute('/_site/_gated/gallery')({ component: GalleryComponent });
