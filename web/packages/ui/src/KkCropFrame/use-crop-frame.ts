import type { KeyboardEvent, PointerEvent, SyntheticEvent, WheelEvent } from 'react';
import { useRef, useState } from 'react';
import type { KkCrop, KkCropImage, KkCropView } from '../crop-frame';
import { KK_CROP_MIN_ZOOM, panView, resolveCrop, resolveView, zoomView } from '../crop-frame';

const KEY_PAN_SHARE = 0.05;
const CENTRED_VIEW: KkCropView = { zoom: KK_CROP_MIN_ZOOM, centerX: 0.5, centerY: 0.5 };
const KEY_ZOOM_STEP = 0.1;
const WHEEL_ZOOM_RATE = 0.0015;

interface PointerSpot {
  x: number;
  y: number;
}

interface UseCropFrameOptions {
  aspect: number;
  initialCrop: KkCrop | null;
  onCropChange: (crop: KkCrop) => void;
}

export interface KkCropFrameControls {
  crop: KkCrop | null;
  zoom: number;
  onImageLoad: (event: SyntheticEvent<HTMLImageElement>) => void;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
  onWheel: (event: WheelEvent<HTMLDivElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  onZoomChange: (zoom: number) => void;
}

const KEY_SHIFTS: Record<string, PointerSpot> = {
  ArrowLeft: { x: 1, y: 0 },
  ArrowRight: { x: -1, y: 0 },
  ArrowUp: { x: 0, y: 1 },
  ArrowDown: { x: 0, y: -1 },
};

const KEY_ZOOMS: Record<string, number> = {
  '+': KEY_ZOOM_STEP,
  '=': KEY_ZOOM_STEP,
  '-': -KEY_ZOOM_STEP,
};

const spreadOf = (spots: PointerSpot[]): number => {
  const [first, second] = spots;
  if (first === undefined || second === undefined) {
    return 0;
  }

  return Math.hypot(first.x - second.x, first.y - second.y);
};

export const useCropFrame = ({
  aspect,
  initialCrop,
  onCropChange,
}: UseCropFrameOptions): KkCropFrameControls => {
  const [image, setImage] = useState<KkCropImage | null>(null);
  const [view, setView] = useState<KkCropView>(CENTRED_VIEW);
  const pointers = useRef(new Map<number, PointerSpot>());

  const commit = (next: KkCropView, loaded: KkCropImage): void => {
    setView(next);
    onCropChange(resolveCrop(next, loaded, aspect));
  };

  const onImageLoad = (event: SyntheticEvent<HTMLImageElement>): void => {
    const loaded = {
      width: event.currentTarget.naturalWidth,
      height: event.currentTarget.naturalHeight,
    };
    setImage(loaded);
    commit(resolveView(initialCrop, loaded, aspect), loaded);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>): void => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>): void => {
    const last = pointers.current.get(event.pointerId);
    if (image === null || last === undefined) {
      return;
    }

    const spreadBefore = spreadOf([...pointers.current.values()]);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.current.size > 1) {
      const spreadAfter = spreadOf([...pointers.current.values()]);
      if (spreadBefore > 0) {
        commit(zoomView(view, image, aspect, (view.zoom * spreadAfter) / spreadBefore), image);
      }
      return;
    }

    const frameWidth = event.currentTarget.getBoundingClientRect().width;
    commit(
      panView(view, image, aspect, {
        x: event.clientX - last.x,
        y: event.clientY - last.y,
        frameWidth,
      }),
      image,
    );
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>): void => {
    pointers.current.delete(event.pointerId);
  };

  const onWheel = (event: WheelEvent<HTMLDivElement>): void => {
    if (image === null) {
      return;
    }
    commit(zoomView(view, image, aspect, view.zoom * (1 - event.deltaY * WHEEL_ZOOM_RATE)), image);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (image === null) {
      return;
    }

    const shift = KEY_SHIFTS[event.key];
    const zoomStep = KEY_ZOOMS[event.key];
    if (shift !== undefined) {
      event.preventDefault();
      const frameWidth = event.currentTarget.getBoundingClientRect().width;
      const step = frameWidth * KEY_PAN_SHARE;
      commit(
        panView(view, image, aspect, { x: shift.x * step, y: shift.y * step, frameWidth }),
        image,
      );
    } else if (zoomStep !== undefined) {
      event.preventDefault();
      commit(zoomView(view, image, aspect, view.zoom + zoomStep), image);
    }
  };

  const onZoomChange = (zoom: number): void => {
    if (image === null) {
      return;
    }
    commit(zoomView(view, image, aspect, zoom), image);
  };

  const crop = image === null ? null : resolveCrop(view, image, aspect);

  return {
    crop,
    zoom: view.zoom,
    onImageLoad,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onWheel,
    onKeyDown,
    onZoomChange,
  };
};
