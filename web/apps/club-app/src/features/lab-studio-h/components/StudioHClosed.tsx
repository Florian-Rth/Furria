import { KkEmptyState } from '@furria/ui/KkEmptyState';
import type { FC } from 'react';
import { STUDIO_H_CLOSED } from '../studio-h-copy';

interface StudioHClosedProps {
  name: string;
}

export const StudioHClosed: FC<StudioHClosedProps> = ({ name }) => (
  <KkEmptyState title={name} description={STUDIO_H_CLOSED} />
);
