import type { RelayPiece } from './relay-dom';
import type { RelayOffset, RelayPlacement } from './relay-flight';

export type RelayGhostPivot = 'text' | 'mark';

export interface RelayGhost {
  element: HTMLElement;
  piece: RelayPiece;
}

const TEXT_PIVOT = '0 0';
const MARK_PIVOT = '50% 50%';

export const createGhostLayer = (zIndex: number): HTMLElement => {
  const layer = document.createElement('div');

  layer.setAttribute('data-kk-relay-ghosts', '');
  Object.assign(layer.style, {
    position: 'fixed',
    inset: '0',
    pointerEvents: 'none',
    zIndex: String(zIndex),
  });
  document.body.appendChild(layer);

  return layer;
};

export const ghostOf = (
  layer: HTMLElement,
  piece: RelayPiece,
  pivot: RelayGhostPivot,
  color: string = piece.color,
): RelayGhost => {
  const clone = piece.clone.cloneNode(true);
  const element = clone instanceof HTMLElement ? clone : document.createElement('span');

  Object.assign(element.style, {
    position: 'absolute',
    left: '0',
    top: '0',
    margin: '0',
    boxSizing: 'border-box',
    width: `${piece.rect.width}px`,
    maxWidth: 'none',
    color,
    opacity: '0',
    transformOrigin: pivot === 'text' ? TEXT_PIVOT : MARK_PIVOT,
    willChange: 'transform, opacity',
  });
  layer.appendChild(element);

  return { element, piece };
};

const place = (
  element: HTMLElement,
  x: number,
  y: number,
  scale: number,
  rotate: number,
  opacity: number,
): void => {
  element.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg) scale(${scale})`;
  element.style.opacity = String(opacity);
};

export const placeText = (
  ghost: RelayGhost,
  placement: RelayPlacement,
  offset: RelayOffset,
  opacity: number,
): void => {
  place(
    ghost.element,
    placement.x + offset.x,
    placement.y + offset.y,
    placement.scale * offset.scale,
    offset.rotate,
    opacity * offset.opacity,
  );
};

export const placeAtRest = (ghost: RelayGhost, offset: RelayOffset): void => {
  const { rect } = ghost.piece;

  place(
    ghost.element,
    rect.left + offset.x,
    rect.top + offset.y,
    offset.scale,
    offset.rotate,
    offset.opacity,
  );
};
