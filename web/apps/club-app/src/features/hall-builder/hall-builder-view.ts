import { elementBounds, findElement, hallBounds, verticesOf } from '@/features/hall-plan/hall-ops';
import type { Bounds } from '@/features/hall-plan/plan-geometry';
import { boundsCenter, unionBounds } from '@/features/hall-plan/plan-geometry';
import type { AreaElement, HallDocument, HallElement, Point } from '@/features/hall-plan/schemas';
import { AREA_KIND_LABELS, NO_SIZE_VALUE } from './hall-builder-copy';
import { vertexHandleId } from './hall-gesture';

const CENTIMETRES_PER_METRE = 100;

const METRES = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export interface SelectionFrame {
  x: number;
  y: number;
  widthCm: number;
  heightCm: number;
  rotation: number;
  resizable: boolean;
  rotatable: boolean;
}

export interface VertexHandle {
  id: string;
  x: number;
  y: number;
}

const metresOf = (centimetres: number): string =>
  METRES.format(centimetres / CENTIMETRES_PER_METRE);

export const sizeLabelOf = (bounds: Bounds | null): string =>
  bounds === null
    ? NO_SIZE_VALUE
    : `${metresOf(bounds.maxX - bounds.minX)} × ${metresOf(bounds.maxY - bounds.minY)} m`;

const wallBounds = (document: HallDocument): Bounds | null =>
  unionBounds(document.elements.filter((element) => element.kind === 'wall').map(elementBounds));

export const hallSizeLabel = (document: HallDocument): string =>
  sizeLabelOf(wallBounds(document) ?? hallBounds(document));

export const areaLabelOf = (area: AreaElement): string => area.label ?? AREA_KIND_LABELS[area.area];

const frameOfBounds = (bounds: Bounds, rotatable: boolean): SelectionFrame => {
  const center = boundsCenter(bounds);

  return {
    x: center.x,
    y: center.y,
    widthCm: bounds.maxX - bounds.minX,
    heightCm: bounds.maxY - bounds.minY,
    rotation: 0,
    resizable: false,
    rotatable,
  };
};

const singleFrameOf = (element: HallElement): SelectionFrame => {
  switch (element.kind) {
    case 'area':
      return element.shape === 'polygon'
        ? frameOfBounds(elementBounds(element), true)
        : {
            x: element.x,
            y: element.y,
            widthCm: element.widthCm,
            heightCm: element.heightCm,
            rotation: element.rotation,
            resizable: true,
            rotatable: true,
          };
    case 'pillar':
      return {
        x: element.x,
        y: element.y,
        widthCm: element.widthCm,
        heightCm: element.heightCm,
        rotation: 0,
        resizable: true,
        rotatable: false,
      };
    default:
      return frameOfBounds(elementBounds(element), true);
  }
};

export const selectionFrameOf = (
  document: HallDocument,
  selection: readonly string[],
): SelectionFrame | null => {
  const elements = document.elements.filter((element) => selection.includes(element.id));
  const [only] = elements;
  if (only === undefined) {
    return null;
  }
  if (elements.length === 1) {
    return singleFrameOf(only);
  }
  const bounds = unionBounds(elements.map(elementBounds));

  return bounds === null ? null : frameOfBounds(bounds, true);
};

export const vertexHandlesOf = (
  document: HallDocument,
  selection: readonly string[],
): VertexHandle[] => {
  const [only] = selection;
  if (only === undefined || selection.length !== 1) {
    return [];
  }
  const element = findElement(document, only);

  return element === null
    ? []
    : verticesOf(element).map((point: Point, index) => ({
        id: vertexHandleId(index),
        x: point.x,
        y: point.y,
      }));
};

export const selectedElementsOf = (
  document: HallDocument,
  selection: readonly string[],
): HallElement[] => document.elements.filter((element) => selection.includes(element.id));
