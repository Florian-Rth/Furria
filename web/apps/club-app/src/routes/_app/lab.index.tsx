import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { LabHubPage } from '@/features/lab';

const LabRoute: FC = () => <LabHubPage />;

export const Route = createFileRoute('/_app/lab/')({ component: LabRoute });
