import type { RelayPiece } from './relay-dom';
import type { RelayOffset, RelayPlacement, RelayTextFlight, RelayTextSpot } from './relay-flight';
import {
  echoAt,
  fitScaleOf,
  landingGlowAt,
  NEUTRAL_OFFSET,
  textHandoverAt,
  textPlacementOf,
  textSpotAt,
} from './relay-flight';
import type { RelayGhost } from './relay-ghosts';
import { ghostOf, placeAtRest, placeText } from './relay-ghosts';

const ECHO_COUNT = 2;

export interface RelayTroupe {
  fly: (progress: number, flight: RelayTextFlight) => void;
  pass: (
    progress: number,
    outAt: (progress: number) => RelayOffset,
    inAt: (progress: number) => RelayOffset,
  ) => void;
}

const echoesOf = (layer: HTMLElement, piece: RelayPiece): RelayGhost[] =>
  Array.from({ length: ECHO_COUNT }, () => ghostOf(layer, piece, 'text'));

export const troupeOf = (
  layer: HTMLElement,
  source: RelayPiece,
  target: RelayPiece,
  flare: string,
): RelayTroupe => {
  const echoes = echoesOf(layer, source);
  const glow = ghostOf(layer, target, 'text', flare);
  const sourceGhost = ghostOf(layer, source, 'text');
  const targetGhost = ghostOf(layer, target, 'text');

  const placeGlow = (progress: number, landing: RelayGhost['piece']['rect']): void => {
    const flash = landingGlowAt(progress);
    const widening = ((flash.scale - 1) * landing.width) / 2;

    placeAtRest(glow, {
      ...NEUTRAL_OFFSET,
      x: landing.left - glow.piece.rect.left - widening,
      y: landing.top - glow.piece.rect.top - ((flash.scale - 1) * landing.height) / 2,
      scale: flash.scale,
      opacity: flash.opacity,
    });
  };

  const fitted = (spot: RelayTextSpot): RelayPlacement => {
    const placement = textPlacementOf(spot, source);

    return {
      ...placement,
      scale: fitScaleOf(placement.scale, placement.x, source.rect.width, window.innerWidth),
    };
  };

  const fly = (progress: number, flight: RelayTextFlight): void => {
    const spot = textSpotAt(flight, progress);
    const handover = textHandoverAt(progress);

    echoes.forEach((echo, index) => {
      const trail = echoAt(progress, index);

      placeText(echo, fitted(textSpotAt(flight, trail.progress)), NEUTRAL_OFFSET, trail.opacity);
    });
    placeText(sourceGhost, fitted(spot), NEUTRAL_OFFSET, handover.source);
    placeText(targetGhost, textPlacementOf(spot, target), NEUTRAL_OFFSET, handover.target);

    const landing = textPlacementOf({ ...flight.to }, target);

    placeGlow(progress, new DOMRect(landing.x, landing.y, target.rect.width, target.lineHeight));
  };

  const pass = (
    progress: number,
    outAt: (progress: number) => RelayOffset,
    inAt: (progress: number) => RelayOffset,
  ): void => {
    echoes.forEach((echo, index) => {
      const trail = echoAt(progress, index);

      placeAtRest(echo, { ...outAt(trail.progress), opacity: trail.opacity });
    });
    placeAtRest(sourceGhost, outAt(progress));
    placeAtRest(targetGhost, inAt(progress));
    placeGlow(progress, target.rect);
  };

  return { fly, pass };
};
