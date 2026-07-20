import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { PlaceholderPage } from '@/components/PlaceholderPage';

const JoinComponent: FC = () => <PlaceholderPage title="Mitglied werden" />;

export const Route = createFileRoute('/_site/join')({ component: JoinComponent });
