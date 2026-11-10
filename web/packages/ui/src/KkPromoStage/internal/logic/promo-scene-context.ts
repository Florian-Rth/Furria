import { createContext, useContext } from 'react';

export interface PromoSceneState {
  live: boolean;
}

export const PromoSceneContext = createContext<PromoSceneState | null>(null);

export const usePromoScene = (): PromoSceneState => {
  const scene = useContext(PromoSceneContext);

  if (scene === null) {
    throw new Error('usePromoScene must be used inside KkPromoStage.Scene');
  }

  return scene;
};
