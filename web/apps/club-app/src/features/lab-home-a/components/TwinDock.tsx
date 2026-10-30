import { KkPracticeTransport } from '@furria/ui/KkPracticeTransport';
import { KkTwin } from '@furria/ui/KkTwin';
import type { FC } from 'react';
import { PRACTICE_BACK, PRACTICE_FORWARD } from '@/features/act-practice/practice-copy';
import type { TwinScreen } from '../hooks/use-twin-screen';
import { TWIN_DOCK_LABEL } from '../twin-copy';
import { TwinRailLive } from './TwinRailLive';

interface TwinDockProps {
  screen: TwinScreen;
}

export const TwinDock: FC<TwinDockProps> = ({ screen }) => {
  const { practice, loop } = screen;
  const stepless = !practice.canStep;
  const back = (): void => {
    practice.skip('back');
  };
  const forward = (): void => {
    practice.skip('forward');
  };

  return (
    <KkTwin.Dock label={TWIN_DOCK_LABEL}>
      <KkTwin.Cell area="rail">
        <TwinRailLive screen={screen} />
      </KkTwin.Cell>
      <KkTwin.Cell area="keys">
        <KkTwin.Keys>
          <KkPracticeTransport.Pill>
            <KkPracticeTransport.Skip
              direction="back"
              label={PRACTICE_BACK}
              disabled={stepless}
              onSkip={back}
            />
            <KkPracticeTransport.Play
              playing={practice.playing}
              label={practice.playLabel}
              disabled={!practice.canPlay}
              onToggle={practice.toggle}
            />
            <KkPracticeTransport.Skip
              direction="forward"
              label={PRACTICE_FORWARD}
              disabled={stepless}
              onSkip={forward}
            />
          </KkPracticeTransport.Pill>
          <KkPracticeTransport.Pill>
            <KkPracticeTransport.Rate
              text={practice.rateText}
              label={practice.rateLabel}
              slowed={practice.slowed}
              onPress={practice.slowDown}
            />
            <KkTwin.Loop
              kind={practice.loopKind}
              text={loop.text}
              label={loop.label}
              disabled={stepless}
              onPress={loop.cycle}
            />
          </KkPracticeTransport.Pill>
        </KkTwin.Keys>
      </KkTwin.Cell>
    </KkTwin.Dock>
  );
};
