import { KkScreen } from '@furria/ui/KkScreen';
import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { FC } from 'react';
import type { ActPageSearch, ActStudioResponse, Studio } from '@/features/acts/schemas';
import { useActHub } from '../hooks/use-act-hub';
import { ScoreBody } from './ScoreBody';

interface ActHubScreenProps {
  data: ActStudioResponse;
  studio: Studio;
  search: ActPageSearch;
  viewerId: number | null;
  title: string;
  origin: KkScreenOrigin;
}

export const ActHubScreen: FC<ActHubScreenProps> = ({
  data,
  studio,
  search,
  viewerId,
  title,
  origin,
}) => {
  const score = useActHub(data, studio, search, viewerId);

  return (
    <KkScreen kind="detail" title={title} origin={origin} actions={score.actions}>
      <ScoreBody score={score} />
    </KkScreen>
  );
};
