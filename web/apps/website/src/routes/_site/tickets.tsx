import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { PlaceholderPage } from '@/components/PlaceholderPage';

const TicketsComponent: FC = () => <PlaceholderPage title="Tickets" />;

export const Route = createFileRoute('/_site/tickets')({ component: TicketsComponent });
