import { KkEjCompass } from '@furria/ui/KkEjCompass';
import { KkEjPanel } from '@furria/ui/KkEjPanel';
import type { FC } from 'react';
import { COMPASS_POINTS } from '../edit-jobs';
import { compassLabelOf, EJ_COMPASS, EJ_UNFACE, EJ_UNFACE_LABEL } from '../edit-jobs-copy';
import type { EjCompass } from '../edit-jobs-view';

interface EjCompassSectionProps {
  title: string;
  aside: string;
  compass: EjCompass;
}

export const EjCompassSection: FC<EjCompassSectionProps> = ({ title, aside, compass }) => {
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
