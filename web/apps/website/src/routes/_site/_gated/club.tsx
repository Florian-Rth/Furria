import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { PlaceholderPage } from '@/components/PlaceholderPage';

const ClubComponent: FC = () => <PlaceholderPage title="Verein" />;

export const Route = createFileRoute('/_site/_gated/club')({ component: ClubComponent });
