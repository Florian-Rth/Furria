import { useReducedMotion } from 'motion/react';
import { useState } from 'react';

const COLLAPSE_DURATION_MS = 260;

export const resolveExpandedSession = (current: number | null, startYear: number): number | null =>
  current === startYear ? null : startYear;

export const resolveCollapseTimeout = (reducedMotion: boolean | null): number =>
  reducedMotion === true ? 0 : COLLAPSE_DURATION_MS;

export const buildOlderSessionToggleId = (startYear: number): string =>
  `older-session-${startYear}-toggle`;

export const buildOlderSessionPanelId = (startYear: number): string =>
  `older-session-${startYear}-panel`;

export interface ExpandedSessionState {
  expandedStartYear: number | null;
  collapseTimeout: number;
  toggle: (startYear: number) => void;
}

export const useExpandedSession = (): ExpandedSessionState => {
  const [expandedStartYear, setExpandedStartYear] = useState<number | null>(null);
  const reducedMotion = useReducedMotion();

  return {
    expandedStartYear,
    collapseTimeout: resolveCollapseTimeout(reducedMotion),
    toggle: (startYear: number): void =>
      setExpandedStartYear((current) => resolveExpandedSession(current, startYear)),
  };
};
