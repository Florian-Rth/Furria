import { KkTwin } from '@furria/ui/KkTwin';
import type { FC } from 'react';
import { PracticeCountLive } from '@/features/act-practice/components/PracticeCountLive';
import type { TwinScreen } from '../hooks/use-twin-screen';
import { TWIN_SPINE_LABEL } from '../twin-copy';
import { TwinCueLive } from './TwinCueLive';
import { TwinEyebrowLive } from './TwinEyebrowLive';

interface TwinSpineProps {
  screen: TwinScreen;
}

export const TwinSpine: FC<TwinSpineProps> = ({ screen }) => {
  const { practice, playback, note } = screen;

  return (
    <KkTwin.Spine label={TWIN_SPINE_LABEL}>
      <KkTwin.Cell area="eyebrow">
        <TwinEyebrowLive screen={screen} />
      </KkTwin.Cell>
      <KkTwin.Cell area="cue">
        <TwinCueLive screen={screen} />
      </KkTwin.Cell>
      <KkTwin.Cell area="name">
        <KkTwin.Step stepKey={practice.stepKey} name={practice.stepName} />
      </KkTwin.Cell>
      <KkTwin.Cell area="count">
        <PracticeCountLive player={playback.player} segments={playback.segments} />
      </KkTwin.Cell>
      <KkTwin.Cell area="note">
        <KkTwin.Note stepKey={practice.stepKey} text={note.text} onOpen={note.open} />
      </KkTwin.Cell>
    </KkTwin.Spine>
  );
};
