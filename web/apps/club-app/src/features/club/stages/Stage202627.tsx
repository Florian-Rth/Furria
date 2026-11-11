import { KkOrbitScene } from '@furria/ui/KkOrbitScene';
import type { FC } from 'react';
import jesterGlobe from './globe-202627.webp';

const JESTER_GLOBE_ASPECT = '600 / 455';
const centre = (
  <KkOrbitScene.Centre image={{ src: jesterGlobe }} aspectRatio={JESTER_GLOBE_ASPECT} />
);

export const Stage202627: FC = () => (
  <KkOrbitScene centre={centre}>
    <KkOrbitScene.Planet tone="green" orbit={1} />
    <KkOrbitScene.Planet tone="gold" orbit={2} />
    <KkOrbitScene.Planet tone="blue" orbit={3} />
  </KkOrbitScene>
);
