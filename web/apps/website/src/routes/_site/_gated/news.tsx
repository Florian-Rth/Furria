import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { PlaceholderPage } from '@/components/PlaceholderPage';

const NewsComponent: FC = () => <PlaceholderPage title="Aktuelles" />;

export const Route = createFileRoute('/_site/_gated/news')({ component: NewsComponent });
