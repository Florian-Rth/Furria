import { KkGroupCardSkeleton } from '@furria/ui/KkGroupCardSkeleton';
import type { FC } from 'react';

const FULL_HEIGHT = { height: '100%' } as const;

export const GroupCardSkeleton: FC = () => <KkGroupCardSkeleton sx={FULL_HEIGHT} />;
