import type { KkScreenMove } from '../../screen-move';
import type { RelayArrival, RelayDeparture, RelayPiece } from './relay-dom';
import { anchorOf, pieceOf } from './relay-dom';
import {
  controlOf,
  handInAt,
  handOffAt,
  NEUTRAL_OFFSET,
  passInAt,
  passOutAt,
} from './relay-flight';
import { ghostOf, placeAtRest } from './relay-ghosts';
import { markChoreographyOf } from './relay-marks';
import type { RelayPlan } from './relay-plan';
import { climbSourceOf, passDirectionOf } from './relay-plan';
import { troupeOf } from './relay-troupe';

export type RelayMovingPlan = Exclude<RelayPlan, 'settled'>;

export interface RelayRun {
  duration: number;
  frame: (progress: number) => void;
  finish: () => void;
}

export interface RelayStage {
  plan: RelayMovingPlan;
  move: KkScreenMove;
  departure: RelayDeparture;
  arrival: RelayArrival;
  layer: HTMLElement;
  flare: string;
}

type RelayFrame = (progress: number) => void;

const DURATIONS: Record<RelayMovingPlan, number> = {
  crossfade: 0.2,
  climb: 0.74,
  descend: 0.74,
  pass: 0.56,
};

const FULL_VIEW = 1;
const HIDDEN = '0';

const climbSourcePiece = (departure: RelayDeparture): RelayPiece | null => {
  const { headline } = departure;
  const sighting =
    headline === null
      ? null
      : {
          top: headline.rect.top,
          bottom: headline.rect.bottom,
          opacity: departure.headlineOpacity,
          barBottom: departure.barBottom,
          viewportHeight: departure.viewportHeight,
        };

  return climbSourceOf(sighting) === 'headline' ? headline : departure.text;
};

const landingOf = (arrival: RelayArrival, departure: RelayDeparture): HTMLElement | null => {
  const { headline } = arrival;

  if (headline === null) {
    return arrival.text;
  }

  const rect = headline.getBoundingClientRect();
  const sighting = {
    top: rect.top,
    bottom: rect.bottom,
    opacity: FULL_VIEW,
    barBottom: departure.barBottom,
    viewportHeight: departure.viewportHeight,
  };

  return climbSourceOf(sighting) === 'headline' ? headline : arrival.text;
};

const climbOf = ({ departure, arrival, layer, flare }: RelayStage): RelayFrame => {
  const marks = markChoreographyOf(layer, departure, arrival);
  const source = climbSourcePiece(departure);

  if (source === null || arrival.text === null) {
    return marks;
  }

  const target = pieceOf(arrival.text);
  const troupe = troupeOf(layer, source, target, flare);
  const from = anchorOf(source.rect, source);
  const to = anchorOf(target.rect, target);
  const flight = { from, to, control: controlOf(from, to, 'swoop') };
  const leftover =
    source === departure.headline && departure.text !== null
      ? ghostOf(layer, departure.text, 'text')
      : null;

  return (progress) => {
    troupe.fly(progress, flight);
    marks(progress);

    if (leftover !== null) {
      placeAtRest(leftover, handOffAt(progress));
    }
  };
};

const descendOf = (
  { departure, arrival, layer, flare }: RelayStage,
  hide: (element: HTMLElement) => void,
): RelayFrame => {
  const marks = markChoreographyOf(layer, departure, arrival);
  const landing = landingOf(arrival, departure);

  if (departure.text === null || landing === null) {
    return marks;
  }

  const source = departure.text;
  const target = pieceOf(landing);
  const troupe = troupeOf(layer, source, target, flare);
  const from = anchorOf(source.rect, source);
  const barArrival =
    landing !== arrival.text && arrival.text !== null
      ? ghostOf(layer, pieceOf(arrival.text), 'text')
      : null;

  hide(landing);

  return (progress) => {
    const to = anchorOf(landing.getBoundingClientRect(), target);

    troupe.fly(progress, { from, to, control: controlOf(from, to, 'toss') });
    marks(progress);

    if (barArrival !== null) {
      placeAtRest(barArrival, handInAt(progress));
    }
  };
};

const passOf = ({ departure, arrival, layer, flare, move }: RelayStage): RelayFrame => {
  const marks = markChoreographyOf(layer, departure, arrival);

  if (departure.text === null || arrival.text === null) {
    return marks;
  }

  const direction = passDirectionOf(move);
  const troupe = troupeOf(layer, departure.text, pieceOf(arrival.text), flare);
  const inAt = (progress: number) => passInAt(progress, direction);
  const outAt = (progress: number) => passOutAt(progress, direction);

  return (progress) => {
    troupe.pass(progress, outAt, inAt);
    marks(progress);
  };
};

const crossfadeOf = ({ departure, arrival, layer }: RelayStage): RelayFrame => {
  const leaving = [departure.text, departure.mark]
    .filter((piece) => piece !== null)
    .map((piece) => ghostOf(layer, piece, 'text'));

  return (progress) => {
    arrival.wrapper.style.opacity = String(progress);

    for (const ghost of leaving) {
      placeAtRest(ghost, { ...NEUTRAL_OFFSET, opacity: 1 - progress });
    }
  };
};

export const relayRunOf = (stage: RelayStage): RelayRun => {
  const hidden: HTMLElement[] = [];
  let finished = false;

  const hide = (element: HTMLElement): void => {
    element.style.visibility = 'hidden';
    hidden.push(element);
  };

  const finish = (): void => {
    if (finished) {
      return;
    }

    finished = true;
    stage.layer.remove();
    stage.arrival.wrapper.style.opacity = '';

    for (const element of hidden) {
      element.style.visibility = '';
    }
  };

  const frames: Record<RelayMovingPlan, () => RelayFrame> = {
    crossfade: () => crossfadeOf(stage),
    climb: () => climbOf(stage),
    descend: () => descendOf(stage, hide),
    pass: () => passOf(stage),
  };

  stage.arrival.wrapper.style.opacity = HIDDEN;

  const frame = frames[stage.plan]();

  return { duration: DURATIONS[stage.plan], frame, finish };
};
