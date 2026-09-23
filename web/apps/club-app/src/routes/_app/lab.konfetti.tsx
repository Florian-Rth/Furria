import { konfettiDockStage } from '@furria/ui';
import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { HandoverLabPage } from '@/features/lab';

const KonfettiLabRoute: FC = () => <HandoverLabPage stage={konfettiDockStage} />;

export const Route = createFileRoute('/_app/lab/konfetti')({ component: KonfettiLabRoute });
