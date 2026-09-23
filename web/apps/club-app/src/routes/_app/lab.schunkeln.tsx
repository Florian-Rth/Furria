import { schunkelnStage } from '@furria/ui';
import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { HandoverLabPage } from '@/features/lab';

const SchunkelnLabRoute: FC = () => <HandoverLabPage stage={schunkelnStage} />;

export const Route = createFileRoute('/_app/lab/schunkeln')({ component: SchunkelnLabRoute });
