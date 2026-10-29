import { KkStudioDPlayer } from '@furria/ui/KkStudioDPlayer';
import type { FC, ReactNode } from 'react';
import { STUDIO_D_CLOSE, STUDIO_D_PLAYER_LABEL } from '../studio-d-copy';

interface StudioDClosedProps {
  title: string;
  eyebrow: string | null;
  note?: ReactNode;
  onClose: () => void;
}

export const StudioDClosed: FC<StudioDClosedProps> = ({ title, eyebrow, note, onClose }) => (
  <KkStudioDPlayer label={STUDIO_D_PLAYER_LABEL} awake>
    <KkStudioDPlayer.Top>
      <KkStudioDPlayer.Close label={STUDIO_D_CLOSE} onClose={onClose} />
      <KkStudioDPlayer.Title eyebrow={eyebrow} title={title} />
    </KkStudioDPlayer.Top>
    {note}
  </KkStudioDPlayer>
);
