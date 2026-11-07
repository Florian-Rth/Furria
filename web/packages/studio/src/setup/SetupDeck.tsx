import { SetupPicture } from '@furria/studio/SetupPicture';
import { SetupTimelineView } from '@furria/studio/SetupTimelineView';
import { SetupTransport } from '@furria/studio/SetupTransport';
import { workingLaneOf } from '@furria/studio/setup-task';
import type { SetupTimeline } from '@furria/studio/use-setup-timeline';
import type { StepSetup } from '@furria/studio/use-step-setup';
import { KkSsFrame } from '@furria/ui/KkSsFrame';
import type { FC } from 'react';

interface SetupDeckProps {
  setup: StepSetup;
  timeline: SetupTimeline;
}

export const SetupDeck: FC<SetupDeckProps> = ({ setup, timeline }) => {
  const focus = workingLaneOf(setup.stage);
  const wide = setup.screen.editor === 'desk';
  const playSpan = setup.stage === 'video' ? setup.range : null;

  return (
    <>
      <KkSsFrame.Picture>
        <SetupPicture setup={setup} />
      </KkSsFrame.Picture>
      <KkSsFrame.Timeline>
        <SetupTimelineView timeline={timeline} focus={focus} wide={wide} />
      </KkSsFrame.Timeline>
      <KkSsFrame.Transport>
        <SetupTransport
          screen={setup.screen}
          centre={timeline.centre}
          wide={wide}
          playSpan={playSpan}
        />
      </KkSsFrame.Transport>
    </>
  );
};
