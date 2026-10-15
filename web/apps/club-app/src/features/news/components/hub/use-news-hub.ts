import type { KkScreenActions } from '@furria/ui';
import type { UseQueryResult } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useNewsHubQuery } from '../../api';
import type { HubSection } from '../../hub-view';
import { hubSectionsOf } from '../../hub-view';
import { NEW_POST_ID, NEW_POST_LABEL, NEWS_EDITOR_ROUTE } from '../../news-copy';
import type { PressRulerView } from '../../press-ruler';
import { pressRulerOf } from '../../press-ruler';
import type { NewsHub } from '../../schemas';
import { sectionLandingOf } from './hub-lines';

const HIGHLIGHT_MS = 1800;
const ROW_SELECTOR = 'data-kk-press-row';
const LANDING_SELECTOR = 'data-kk-landing';

export interface NewsHubState {
  query: UseQueryResult<NewsHub, Error>;
  sections: HubSection[];
  ruler: PressRulerView;
  isEmpty: boolean;
  highlightedId: string | null;
  actions: KkScreenActions;
  openPost: (postId: string) => void;
  openNew: () => void;
  revealPost: (postId: string) => void;
  revealSection: (sectionKey: string) => void;
}

export const useNewsHub = (): NewsHubState => {
  const navigate = useNavigate();
  const query = useNewsHubQuery();
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const highlightTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (highlightTimer.current !== null) {
        window.clearTimeout(highlightTimer.current);
      }
    },
    [],
  );
  const sections = query.data === undefined ? [] : hubSectionsOf(query.data);

  const openPost = (postId: string): void => {
    void navigate({ to: NEWS_EDITOR_ROUTE, params: { postId } });
  };

  const revealPost = (postId: string): void => {
    document
      .querySelector(`[${ROW_SELECTOR}="${postId}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightedId(postId);
    if (highlightTimer.current !== null) {
      window.clearTimeout(highlightTimer.current);
    }
    highlightTimer.current = window.setTimeout(() => {
      highlightTimer.current = null;
      setHighlightedId(null);
    }, HIGHLIGHT_MS);
  };

  const revealSection = (sectionKey: string): void => {
    document
      .querySelector(`[${LANDING_SELECTOR}="${sectionLandingOf(sectionKey)}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openNew = (): void => {
    openPost(NEW_POST_ID);
  };

  const actions: KkScreenActions = [
    { id: 'new', label: NEW_POST_LABEL, icon: 'add', emphasis: true, onSelect: openNew },
  ];

  return {
    query,
    sections,
    ruler: pressRulerOf(sections, new Date()),
    isEmpty: sections.length === 0,
    highlightedId,
    actions,
    openPost,
    openNew,
    revealPost,
    revealSection,
  };
};
