import type { FC } from 'react';
import type { ReelSceneProps } from '../reel-scene-props';
import type { ReelSceneKey } from '../reel-timeline';
import { BeerScene } from './scenes/BeerScene';
import { CalendarScene } from './scenes/CalendarScene';
import { DanceScene } from './scenes/DanceScene';
import { EventScene } from './scenes/EventScene';
import { FinaleScene } from './scenes/FinaleScene';
import { GalleryScene } from './scenes/GalleryScene';
import { OpenerScene } from './scenes/OpenerScene';
import { StartScene } from './scenes/StartScene';
import { WebsiteScene } from './scenes/WebsiteScene';

const SCENES: Record<ReelSceneKey, FC<ReelSceneProps>> = {
  opener: OpenerScene,
  start: StartScene,
  calendar: CalendarScene,
  event: EventScene,
  dance: DanceScene,
  beer: BeerScene,
  gallery: GalleryScene,
  website: WebsiteScene,
  finale: FinaleScene,
};

interface PromoSceneSlotProps extends ReelSceneProps {
  sceneKey: ReelSceneKey;
}

export const PromoSceneSlot: FC<PromoSceneSlotProps> = ({ sceneKey, ...scene }) => {
  const Scene = SCENES[sceneKey];

  return <Scene {...scene} />;
};
