import { compassLabelOf, JOB_COMPASS, JOB_UNFACE, JOB_UNFACE_LABEL } from '@furria/studio/job-copy';
import { COMPASS_POINTS } from '@furria/studio/job-model';
import type { JobCompass } from '@furria/studio/job-view';
import { KkCompass } from '@furria/ui/KkCompass';
import { KkJobPanel } from '@furria/ui/KkJobPanel';
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
      <KkCompass.Arrow
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
    <KkJobPanel.Group label={title}>
      <KkJobPanel.GroupHead text={title} aside={aside} />
      <KkCompass label={JOB_COMPASS}>
        {arrows}
        <KkCompass.Free
          text={JOB_UNFACE}
          label={JOB_UNFACE_LABEL}
          pressed={free}
          onPress={compass.free}
        />
      </KkCompass>
    </KkJobPanel.Group>
  );
};
