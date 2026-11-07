import { COMPASS_POINTS } from '@furria/studio/edit-jobs';
import {
  compassLabelOf,
  EJ_COMPASS,
  EJ_UNFACE,
  EJ_UNFACE_LABEL,
} from '@furria/studio/edit-jobs-copy';
import type { JobCompass } from '@furria/studio/edit-jobs-view';
import { KkEjCompass } from '@furria/ui/KkEjCompass';
import { KkEjPanel } from '@furria/ui/KkEjPanel';
import type { FC } from 'react';

interface JobCompassSectionProps {
  title: string;
  aside: string;
  compass: JobCompass;
}

export const JobCompassSection: FC<JobCompassSectionProps> = ({ title, aside, compass }) => {
  const arrows = COMPASS_POINTS.map((point) => {
    const choose = (): void => {
      compass.choose(point);
    };

    return (
      <KkEjCompass.Arrow
        key={point}
        degrees={point}
        label={compassLabelOf(point)}
        pressed={compass.point === point}
        onPress={choose}
      />
    );
  });
  const free = compass.point === null;

  return (
    <KkEjPanel.Group label={title}>
      <KkEjPanel.GroupHead text={title} aside={aside} />
      <KkEjCompass label={EJ_COMPASS}>
        {arrows}
        <KkEjCompass.Free
          text={EJ_UNFACE}
          label={EJ_UNFACE_LABEL}
          pressed={free}
          onPress={compass.free}
        />
      </KkEjCompass>
    </KkEjPanel.Group>
  );
};
