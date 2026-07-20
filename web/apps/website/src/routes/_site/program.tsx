import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { PlaceholderPage } from '@/components/PlaceholderPage';

const ProgramComponent: FC = () => <PlaceholderPage title="Programm" />;

export const Route = createFileRoute('/_site/program')({ component: ProgramComponent });
