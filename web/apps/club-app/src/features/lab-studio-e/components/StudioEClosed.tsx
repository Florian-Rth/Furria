import { KkEmptyState } from '@furria/ui/KkEmptyState';
import type { FC } from 'react';
import { STUDIO_E_NO_ACCESS } from '../studio-e-copy';

interface StudioEClosedProps {
  name: string;
}

export const StudioEClosed: FC<StudioEClosedProps> = ({ name }) => (
  <KkEmptyState title={name} description={STUDIO_E_NO_ACCESS} />
);
