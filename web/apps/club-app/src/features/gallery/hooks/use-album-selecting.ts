import type { MouseEvent, PointerEvent } from 'react';
import { useRef, useState } from 'react';
import type { StrokeMode } from '../album-frames';
import { strokeModeOf, strokeSelection } from '../album-frames';

const LONG_PRESS_MS = 420;
const PRESS_TOLERANCE = 8;
const FRAME_SELECTOR = '[data-kk-frame-id]';
const NO_SELECTION: ReadonlySet<number> = new Set();

interface Stroke {
  anchor: number;
  mode: StrokeMode;
  base: ReadonlySet<number>;
  moved: boolean;
}

interface Press {
  timer: number;
  x: number;
  y: number;
}

export interface AlbumStrokeHandlers {
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
  onContextMenu: (event: MouseEvent<HTMLDivElement>) => void;
}

export interface AlbumSelecting {
  active: boolean;
  selected: ReadonlySet<number>;
  selectedIds: number[];
  start: () => void;
  stop: () => void;
  onFrame: (id: number, open: () => void) => void;
  stroke: AlbumStrokeHandlers;
}

const frameIdOf = (target: EventTarget | null): number | null => {
  if (!(target instanceof Element)) {
    return null;
  }
  const raw = target.closest(FRAME_SELECTOR)?.getAttribute('data-kk-frame-id');
  return raw === undefined || raw === null ? null : Number(raw);
};

const frameIdAt = (x: number, y: number): number | null =>
  frameIdOf(document.elementFromPoint(x, y));

const toggled = (selected: ReadonlySet<number>, id: number): Set<number> => {
  const next = new Set(selected);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  return next;
};

export const useAlbumSelecting = (order: readonly number[], allowed: boolean): AlbumSelecting => {
  const [active, setActive] = useState(false);
  const [selected, setSelected] = useState<ReadonlySet<number>>(NO_SELECTION);
  const strokeRef = useRef<Stroke | null>(null);
  const pressRef = useRef<Press | null>(null);
  const swallowRef = useRef(false);

  const cancelPress = (): void => {
    if (pressRef.current !== null) {
      window.clearTimeout(pressRef.current.timer);
      pressRef.current = null;
    }
  };

  const beginStroke = (anchor: number, base: ReadonlySet<number>): void => {
    strokeRef.current = { anchor, mode: strokeModeOf(base, anchor), base, moved: false };
  };

  const start = (): void => {
    setActive(true);
  };

  const stop = (): void => {
    setActive(false);
    setSelected(NO_SELECTION);
    strokeRef.current = null;
  };

  const pressedLong = (id: number): void => {
    pressRef.current = null;
    const base = new Set([id]);
    setActive(true);
    setSelected(base);
    swallowRef.current = true;
    strokeRef.current = { anchor: id, mode: 'add', base, moved: false };
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>): void => {
    const id = frameIdOf(event.target);
    if (!allowed || id === null || event.button !== 0) {
      return;
    }
    if (active) {
      beginStroke(id, selected);
      return;
    }
    cancelPress();
    pressRef.current = {
      timer: window.setTimeout(() => pressedLong(id), LONG_PRESS_MS),
      x: event.clientX,
      y: event.clientY,
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>): void => {
    const press = pressRef.current;
    if (
      press !== null &&
      Math.hypot(event.clientX - press.x, event.clientY - press.y) > PRESS_TOLERANCE
    ) {
      cancelPress();
    }
    const stroke = strokeRef.current;
    if (stroke === null) {
      return;
    }
    const id = frameIdAt(event.clientX, event.clientY);
    if (id === null || (id === stroke.anchor && !stroke.moved)) {
      return;
    }
    stroke.moved = true;
    setSelected(strokeSelection(stroke.base, order, stroke.anchor, id, stroke.mode));
  };

  const onPointerUp = (): void => {
    cancelPress();
    if (strokeRef.current?.moved === true) {
      swallowRef.current = true;
    }
    strokeRef.current = null;
  };

  const onContextMenu = (event: MouseEvent<HTMLDivElement>): void => {
    if (allowed && frameIdOf(event.target) !== null) {
      event.preventDefault();
    }
  };

  const onFrame = (id: number, open: () => void): void => {
    if (swallowRef.current) {
      swallowRef.current = false;
      return;
    }
    if (active) {
      setSelected((current) => toggled(current, id));
      return;
    }
    open();
  };

  return {
    active,
    selected,
    selectedIds: order.filter((id) => selected.has(id)),
    start,
    stop,
    onFrame,
    stroke: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onContextMenu,
    },
  };
};
