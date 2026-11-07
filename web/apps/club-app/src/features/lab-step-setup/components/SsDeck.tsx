import { KkSsFrame } from '@furria/ui/KkSsFrame';
import type { FC } from 'react';
import type { SetupTimeline } from '../hooks/use-setup-timeline';
import type { StepSetup } from '../hooks/use-step-setup';
import { workingLaneOf } from '../setup-task';
import { SsPicture } from './SsPicture';
import { SsTimeline } from './SsTimeline';
import { SsTransport } from './SsTransport';

interface SsDeckProps {
  setup: StepSetup;
  timeline: SetupTimeline;
}

export const SsDeck: FC<SsDeckProps> = ({ setup, timeline }) => {
  const focus = workingLaneOf(setup.stage);
  const wide = setup.screen.editor === 'desk';
  const playSpan = setup.stage === 'video' ? setup.range : null;

  return (
    <>
      <KkSsFrame.Picture>
        <SsPicture setup={setup} />
      </KkSsFrame.Picture>
      <KkSsFrame.Timeline>
        <SsTimeline timeline={timeline} focus={focus} wide={wide} />
      </KkSsFrame.Timeline>
      <KkSsFrame.Transport>
        <SsTransport
          screen={setup.screen}
          centre={timeline.centre}
          wide={wide}
          playSpan={playSpan}
        />
      </KkSsFrame.Transport>
    </>
  );
};
