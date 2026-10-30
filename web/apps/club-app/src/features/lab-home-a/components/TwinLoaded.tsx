import { KkEmptyState } from '@furria/ui/KkEmptyState';
import type { FC } from 'react';
import { PRACTICE_NO_ACCESS } from '@/features/act-practice/practice-copy';
import { canPractise } from '@/features/acts/act-studio';
import type { Studio } from '@/features/acts/schemas';
import { TwinBody } from './TwinBody';
import { TwinSilent } from './TwinSilent';

interface TwinLoadedProps {
  actId: number;
  studio: Studio | null;
  title: string;
  viewerId: number | null;
  onClose: () => void;
  onHall: () => void;
}

export const TwinLoaded: FC<TwinLoadedProps> = ({
  actId,
  studio,
  title,
  viewerId,
  onClose,
  onHall,
}) => {
  if (studio === null) {
    return <KkEmptyState title={title} description={PRACTICE_NO_ACCESS} />;
  }
  if (!canPractise(studio)) {
    return <TwinSilent title={title} onClose={onClose} />;
  }

  return (
    <TwinBody
      key={actId}
      actId={actId}
      studio={studio}
      title={title}
      viewerId={viewerId}
      onClose={onClose}
      onHall={onHall}
    />
  );
};
