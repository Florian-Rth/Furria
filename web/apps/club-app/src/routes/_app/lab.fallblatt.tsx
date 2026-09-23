import { fallblattStage } from '@furria/ui';
import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { HandoverLabPage } from '@/features/lab';

const FallblattLabRoute: FC = () => <HandoverLabPage stage={fallblattStage} />;

export const Route = createFileRoute('/_app/lab/fallblatt')({ component: FallblattLabRoute });
