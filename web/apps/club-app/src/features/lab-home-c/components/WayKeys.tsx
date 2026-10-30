import { KkPracticeTransport } from '@furria/ui/KkPracticeTransport';
import { KkWayKeys } from '@furria/ui/KkWayKeys';
import type { FC } from 'react';
import {
  PRACTICE_BACK,
  PRACTICE_FORWARD,
  PRACTICE_TRANSPORT_LABEL,
} from '@/features/act-practice/practice-copy';
import { useLargeText } from '@/lib/use-large-text';
import type { WayScreen } from '../hooks/use-way-screen';

interface WayKeysProps {
  screen: WayScreen;
}

export const WayKeys: FC<WayKeysProps> = ({ screen }) => {
  const large = useLargeText();
  const { practice, loop, hasMusic } = screen;
  const stepless = !practice.canStep;
  const back = (): void => {
    practice.skip('back');
  };
  const forward = (): void => {
    practice.skip('forward');
  };
  const rate = (
    <KkPracticeTransport.Rate
      text={practice.rateText}
      label={practice.rateLabel}
      slowed={practice.slowed}
      onPress={practice.slowDown}
    />
  );
  const repeat = (
    <KkWayKeys.Toggle
      glyph={loop.glyph}
      label={loop.label}
      pressed={loop.pressed}
      disabled={stepless}
      onPress={loop.press}
    />
  );
  const moves = (
    <>
      <KkPracticeTransport.Skip
        direction="back"
        label={PRACTICE_BACK}
        disabled={stepless}
        onSkip={back}
      />
      <KkPracticeTransport.Play
        playing={practice.playing}
        label={practice.playLabel}
        disabled={!practice.canPlay || !hasMusic}
        onToggle={practice.toggle}
      />
      <KkPracticeTransport.Skip
        direction="forward"
        label={PRACTICE_FORWARD}
        disabled={stepless}
        onSkip={forward}
      />
    </>
  );
  const pills = large ? (
    <>
      <KkPracticeTransport.Pill>{moves}</KkPracticeTransport.Pill>
      <KkPracticeTransport.Pill>
        {rate}
        <KkPracticeTransport.Divider />
        {repeat}
      </KkPracticeTransport.Pill>
    </>
  ) : (
    <KkPracticeTransport.Pill>
      {rate}
      <KkPracticeTransport.Divider />
      {moves}
      <KkPracticeTransport.Divider />
      {repeat}
    </KkPracticeTransport.Pill>
  );

  return <KkPracticeTransport label={PRACTICE_TRANSPORT_LABEL}>{pills}</KkPracticeTransport>;
};
