import { useEffect, useRef, useState } from 'react';
import type { KkResolvedColorScheme } from '../../theme-color';
import type { KkGlobeFeed, KkGlobeSignal } from '../globe-feed';
import type { KkGlobeLadder } from '../globe-ladder';
import { climbLadder, KK_LADDER_START } from '../globe-ladder';
import type { KkGravity } from '../globe-tilt';
import { KK_UPRIGHT } from '../globe-tilt';
import { globeInksOf, paintGlobe } from './globe-paint';
import type { KkGlobeChrome } from './globe-panes';
import { findChrome, findPaneElements, frameOf, paneOf, radiusOf } from './globe-panes';
import type { GlobePane, GlobeWorld } from './globe-world';
import {
  addToGlobe,
  createGlobeWorld,
  fitGlobe,
  frameGlobe,
  GLOBE_STEP_SECONDS,
  movePanes,
  settleGlobe,
  stepGlobe,
} from './globe-world';

const MAX_RATIO = 2;
const MAX_FRAME_SECONDS = 0.05;
const MS = 1000;
const REST_SECONDS = 0.8;
const WAKING_TILT = 0.05;

type LayoutChange = 'none' | 'moved' | 'replaced';

const samePanes = (first: readonly GlobePane[], second: readonly GlobePane[]): boolean =>
  first.length === second.length &&
  first.every((pane, index) => {
    const other = second[index];
    return (
      other !== undefined &&
      pane.left === other.left &&
      pane.top === other.top &&
      pane.right === other.right &&
      pane.bottom === other.bottom
    );
  });

const hasMoved = (from: KkGravity, to: KkGravity): boolean =>
  Math.hypot(from.x - to.x, from.y - to.y) > WAKING_TILT;

export const useGlobeCanvas = (
  feed: KkGlobeFeed,
  still: boolean,
  bottomInset: number,
  scheme: KkResolvedColorScheme,
  colliders: string,
  chrome: KkGlobeChrome,
): ((canvas: HTMLCanvasElement | null) => void) => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [world] = useState<GlobeWorld>(createGlobeWorld);
  const ladderRef = useRef<KkGlobeLadder>(KK_LADDER_START);

  useEffect(() => {
    const context = canvas?.getContext('2d') ?? null;
    if (canvas === null || context === null) {
      return;
    }
    const inks = globeInksOf(scheme);
    const gravityNow = (): KkGravity => (still ? KK_UPRIGHT : feed.gravity());
    const radii = new WeakMap<Element, number>();
    let elements: Element[] = [];
    let ceiling: Element | null = null;
    let footing: Element | null = null;
    let ratio = 1;
    let frame = 0;
    let layoutFrame = 0;
    let last = 0;
    let backlog = 0;
    let asleep = true;
    let change: LayoutChange = 'replaced';
    let restingUnder = gravityNow();

    const resizes = new ResizeObserver(() => {
      noteLayout('moved');
    });
    const radiusFor = (element: Element): number => {
      const known = radii.get(element);
      if (known !== undefined) {
        return known;
      }
      const radius = radiusOf(element);
      radii.set(element, radius);
      return radius;
    };
    const panesOf = (list: readonly Element[]): GlobePane[] =>
      list.map((element) => paneOf(element, radiusFor(element)));
    const flushLayout = (): boolean => {
      const was = change;
      change = 'none';
      if (was === 'none') {
        return false;
      }
      if (was === 'replaced') {
        ceiling = findChrome(chrome.ceiling);
        footing = findChrome(chrome.floor);
      }
      const framed = frameOf(ceiling, footing, window.innerHeight - bottomInset);
      const reframed = framed.top !== world.top || framed.floor !== world.floor;
      if (reframed) {
        frameGlobe(world, framed.top, framed.floor);
        canvas.style.clipPath = `inset(${world.top}px 0 ${world.height - world.floor}px 0)`;
      }
      const next = was === 'replaced' ? findPaneElements(colliders) : elements;
      const panes = panesOf(next);
      if (
        !reframed &&
        next.length === elements.length &&
        next.every((element, index) => element === elements[index]) &&
        samePanes(world.panes, panes)
      ) {
        return false;
      }
      const carried = next.map((element) => elements.indexOf(element));
      if (was === 'replaced') {
        resizes.disconnect();
        for (const element of next) {
          resizes.observe(element);
        }
      }
      elements = next;
      movePanes(world, panes, carried);
      return true;
    };
    const paint = (): void => {
      paintGlobe(context, world, inks, ratio);
    };
    const settleStill = (): void => {
      if (still && world.count > 0) {
        settleGlobe(world);
      }
    };
    const tick = (now: number): void => {
      flushLayout();
      backlog += Math.min((now - last) / MS, MAX_FRAME_SECONDS);
      last = now;
      const gravity = gravityNow();
      while (backlog >= GLOBE_STEP_SECONDS) {
        stepGlobe(world, gravity, GLOBE_STEP_SECONDS);
        backlog -= GLOBE_STEP_SECONDS;
      }
      paint();
      if (world.quietSeconds >= REST_SECONDS) {
        asleep = true;
        restingUnder = gravity;
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    const wake = (): void => {
      if (!asleep || document.hidden || still || world.count === 0) {
        return;
      }
      asleep = false;
      last = performance.now();
      backlog = 0;
      frame = requestAnimationFrame(tick);
    };
    const settleLayout = (): void => {
      layoutFrame = 0;
      if (!asleep || !flushLayout()) {
        return;
      }
      settleStill();
      paint();
      wake();
    };
    const noteLayout = (next: LayoutChange): void => {
      change = change === 'replaced' ? change : next;
      if (asleep && layoutFrame === 0) {
        layoutFrame = requestAnimationFrame(settleLayout);
      }
    };
    const sleep = (): void => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(layoutFrame);
      layoutFrame = 0;
      asleep = true;
      restingUnder = gravityNow();
    };
    const fit = (): void => {
      ratio = Math.min(window.devicePixelRatio || 1, MAX_RATIO);
      canvas.width = Math.round(window.innerWidth * ratio);
      canvas.height = Math.round(window.innerHeight * ratio);
      fitGlobe(world, window.innerWidth, window.innerHeight, bottomInset);
      change = 'replaced';
      flushLayout();
      settleStill();
      paint();
      wake();
    };
    const shake = (): void => {
      const rung = climbLadder(ladderRef.current, performance.now());
      ladderRef.current = rung.ladder;
      flushLayout();
      addToGlobe(world, rung.add, rung.toss, gravityNow());
      if (still) {
        settleGlobe(world);
        paint();
        return;
      }
      wake();
    };
    const hear = (signal: KkGlobeSignal): void => {
      if (signal === 'shake') {
        shake();
        return;
      }
      if (asleep && hasMoved(restingUnder, gravityNow())) {
        world.quietSeconds = 0;
        wake();
      }
    };
    const showOrHide = (): void => {
      if (document.hidden) {
        sleep();
        return;
      }
      world.quietSeconds = 0;
      wake();
    };
    const scrolled = (): void => {
      noteLayout('moved');
    };
    const mutations = new MutationObserver(() => {
      noteLayout('replaced');
    });

    fit();
    const unlisten = feed.listen(hear);
    window.addEventListener('resize', fit);
    document.addEventListener('visibilitychange', showOrHide);
    document.addEventListener('scroll', scrolled, { capture: true, passive: true });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      sleep();
      unlisten();
      resizes.disconnect();
      mutations.disconnect();
      window.removeEventListener('resize', fit);
      document.removeEventListener('visibilitychange', showOrHide);
      document.removeEventListener('scroll', scrolled, { capture: true });
    };
  }, [canvas, feed, still, bottomInset, scheme, colliders, chrome.ceiling, chrome.floor, world]);

  return setCanvas;
};
