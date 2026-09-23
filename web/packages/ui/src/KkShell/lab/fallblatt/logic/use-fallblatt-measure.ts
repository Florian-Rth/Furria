import type { RefObject } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';
import type { FallblattCell, FallblattGlyph } from './fallblatt-flaps';
import { fallblattCellsOf } from './fallblatt-flaps';

export interface FallblattGeometry {
  cells: FallblattCell[];
  top: number;
  height: number;
}

export interface FallblattMeasure {
  stageRef: RefObject<HTMLDivElement | null>;
  restRef: RefObject<HTMLDivElement | null>;
  titleRef: RefObject<HTMLDivElement | null>;
  geometry: FallblattGeometry;
}

const UNMEASURED: FallblattGeometry = { cells: [], top: 0, height: 0 };

const textNodeOf = (node: HTMLElement): Text | null => {
  const found = document.createTreeWalker(node, NodeFilter.SHOW_TEXT).nextNode();

  return found instanceof Text ? found : null;
};

const glyphsOf = (node: HTMLElement | null, originLeft: number): FallblattGlyph[] => {
  const text = node === null ? null : textNodeOf(node);

  if (text === null) {
    return [];
  }

  const range = document.createRange();
  const glyphs: FallblattGlyph[] = [];

  let firstLineTop: number | null = null;

  for (let offset = 0; offset < text.data.length; offset += 1) {
    range.setStart(text, offset);
    range.setEnd(text, offset + 1);
    const box = range.getBoundingClientRect();
    firstLineTop ??= box.top;

    if (box.top > firstLineTop + box.height / 2) {
      break;
    }

    glyphs.push({ char: text.data.charAt(offset), left: box.left - originLeft, width: box.width });
  }

  return glyphs;
};

const geometryOf = (
  stage: HTMLElement,
  rest: HTMLElement | null,
  title: HTMLElement | null,
  measuresRest: boolean,
): FallblattGeometry => {
  const origin = stage.getBoundingClientRect();
  const line = title === null ? origin : title.getBoundingClientRect();
  const from = measuresRest ? glyphsOf(rest, origin.left) : [];

  return {
    cells: fallblattCellsOf(from, glyphsOf(title, origin.left)),
    top: line.top - origin.top,
    height: line.height,
  };
};

export const useFallblattMeasure = (
  restText: string | null,
  titleText: string,
): FallblattMeasure => {
  const stageRef = useRef<HTMLDivElement>(null);
  const restRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [geometry, setGeometry] = useState<FallblattGeometry>(UNMEASURED);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    let live = true;

    if (stage === null || titleText.length === 0) {
      return;
    }

    const measure = (): void => {
      if (live) {
        setGeometry(geometryOf(stage, restRef.current, titleRef.current, restText !== null));
      }
    };

    const observer = new ResizeObserver(measure);

    measure();
    observer.observe(stage);
    void document.fonts.ready.then(measure);

    return () => {
      live = false;
      observer.disconnect();
    };
  }, [restText, titleText]);

  return { stageRef, restRef, titleRef, geometry };
};
