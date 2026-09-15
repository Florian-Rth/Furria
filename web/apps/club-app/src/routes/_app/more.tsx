import { createFileRoute } from '@tanstack/react-router';
import { MorePage } from '@/features/more';

export const Route = createFileRoute('/_app/more')({ component: MorePage });
