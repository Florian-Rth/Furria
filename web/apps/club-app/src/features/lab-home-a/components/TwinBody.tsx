import { KkTwin } from '@furria/ui/KkTwin';
import type { FC } from 'react';
import { PracticeStageLayer } from '@/features/act-practice/components/PracticeStageLayer';
import type { Studio } from '@/features/acts/schemas';
import { HOME_HALL, HOME_HALL_LABEL } from '@/features/lab-home/home-copy';
import { useTwinScreen } from '../hooks/use-twin-screen';
import { TWIN_CLOSE, TWIN_EYEBROW, TWIN_LABEL } from '../twin-copy';
import { TwinDock } from './TwinDock';
import { TwinNoteSheet } from './TwinNoteSheet';
import { TwinSpine } from './TwinSpine';
import { TwinVideo } from './TwinVideo';

interface TwinBodyProps {
  actId: number;
  studio: Studio;
  title: string;
  viewerId: number | null;
  onClose: () => void;
  onHall: () => void;
}

export const TwinBody: FC<TwinBodyProps> = ({
  actId,
  studio,
  title,
  viewerId,
  onClose,
  onHall,
}) => {
  const screen = useTwinScreen(actId, studio, viewerId);

  return (
    <KkTwin label={TWIN_LABEL}>
      <KkTwin.Head>
        <KkTwin.Close label={TWIN_CLOSE} onPress={onClose} />
        <KkTwin.Title eyebrow={TWIN_EYEBROW} title={title} />
        <KkTwin.Switch text={HOME_HALL} label={HOME_HALL_LABEL} onPress={onHall} />
      </KkTwin.Head>
      <KkTwin.Pair stageRatio={screen.stageRatio}>
        <KkTwin.Pane kind="video">
          <TwinVideo screen={screen} />
        </KkTwin.Pane>
        <TwinSpine screen={screen} />
        <KkTwin.Pane kind="stage">
          <PracticeStageLayer studio={screen.studio} playback={screen.playback} />
        </KkTwin.Pane>
      </KkTwin.Pair>
      <TwinDock screen={screen} />
      <TwinNoteSheet screen={screen} />
    </KkTwin>
  );
};
