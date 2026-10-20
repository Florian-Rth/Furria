import type { KkCalendarHeadUnder } from '@furria/ui';
import { KK_CALENDAR_HEAD_TOP } from '@furria/ui';
import { useEffect, useRef, useState } from 'react';
import { anchorKeyOf } from '../calendar-agenda';
import type { CalendarBoard } from './use-calendar-board';

const DAY_SECTION = '[data-kk-calendar-day]';
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const SENTINEL_MARGIN = '900px 0px';
const HEAD_SLACK = 2;
const LANDING_SETTLE_MS = 450;
const USER_INPUTS = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;

interface ScrollTarget {
  day: string;
  instant: boolean;
}

export interface CalendarScroll {
  activeDay: string;
  goToDay: (isoDay: string) => void;
  holdSentinel: (node: HTMLElement | null) => void;
}

const activeDayAt = (headTop: number): string | null => {
  const sections = document.querySelectorAll<HTMLElement>(DAY_SECTION);
  let current: string | null = sections[0]?.dataset.kkCalendarDay ?? null;

  for (const section of sections) {
    if (section.getBoundingClientRect().top > headTop + HEAD_SLACK) {
      break;
    }
    current = section.dataset.kkCalendarDay ?? current;
  }

  return current;
};

export const useCalendarScroll = (
  board: CalendarBoard,
  under: KkCalendarHeadUnder,
): CalendarScroll => {
  const headTop = KK_CALENDAR_HEAD_TOP[under];
  const [activeDay, setActiveDay] = useState(board.landingDay ?? board.todayDay);
  const [target, setTarget] = useState<ScrollTarget | null>(
    board.landingDay === null ? null : { day: board.landingDay, instant: true },
  );
  const [sentinel, setSentinel] = useState<HTMLElement | null>(null);
  const loadLater = useRef(board.loadLater);
  const pinned = useRef<string | null>(board.landingDay);

  useEffect(() => {
    loadLater.current = board.loadLater;
  });

  useEffect(() => {
    let frame = 0;
    const measure = (): void => {
      frame = 0;

      if (pinned.current !== null) {
        return;
      }

      const day = activeDayAt(headTop);

      if (day !== null) {
        setActiveDay(day);
      }
    };
    const onScroll = (): void => {
      if (frame === 0) {
        frame = requestAnimationFrame(measure);
      }
    };

    const release = (): void => {
      pinned.current = null;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    for (const input of USER_INPUTS) {
      window.addEventListener(input, release, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      for (const input of USER_INPUTS) {
        window.removeEventListener(input, release);
      }
      cancelAnimationFrame(frame);
    };
  }, [headTop]);

  useEffect(() => {
    if (target === null || board.phase !== 'ready') {
      return;
    }

    const anchor = anchorKeyOf(board.sections, target.day);
    const node =
      anchor === null ? null : document.querySelector(`[data-kk-calendar-anchor="${anchor}"]`);

    if (node === null) {
      return;
    }

    const reduced = window.matchMedia(REDUCED_MOTION).matches;
    const behavior = target.instant || reduced ? 'instant' : 'smooth';
    const align = (): void => {
      const top = node.getBoundingClientRect().top + window.scrollY - headTop;

      window.scrollTo({ top, behavior });
    };
    if (target.instant) {
      window.setTimeout(align, LANDING_SETTLE_MS);
    }

    align();
    void document.fonts.ready.then(align);
    setTarget(null);
  }, [target, board.sections, board.phase, headTop]);

  useEffect(() => {
    if (sentinel === null || board.window.to === '') {
      return;
    }

    const observer = new IntersectionObserver(
      (records) => {
        if (records.some((record) => record.isIntersecting)) {
          loadLater.current();
        }
      },
      { rootMargin: SENTINEL_MARGIN },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [sentinel, board.window.to]);

  return {
    activeDay,
    goToDay: (isoDay) => {
      pinned.current = isoDay;
      board.cover(isoDay);
      setActiveDay(isoDay);
      setTarget({ day: isoDay, instant: false });
    },
    holdSentinel: setSentinel,
  };
};
