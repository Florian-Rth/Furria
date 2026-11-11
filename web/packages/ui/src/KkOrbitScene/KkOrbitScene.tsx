import { KkOrbitSceneRoot } from './internal/layout/KkOrbitSceneRoot';
import { KkOrbitSceneCentre } from './internal/ui/KkOrbitSceneCentre';
import { KkOrbitScenePlanet } from './internal/ui/KkOrbitScenePlanet';

export const KkOrbitScene = Object.assign(KkOrbitSceneRoot, {
  Centre: KkOrbitSceneCentre,
  Planet: KkOrbitScenePlanet,
});
