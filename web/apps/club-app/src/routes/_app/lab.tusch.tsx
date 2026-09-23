import { tuschStage } from '@furria/ui';
import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { HandoverLabPage } from '@/features/lab';

const TuschLabRoute: FC = () => <HandoverLabPage stage={tuschStage} />;

export const Route = createFileRoute('/_app/lab/tusch')({ component: TuschLabRoute });
