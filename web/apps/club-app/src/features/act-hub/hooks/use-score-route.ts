import { useNavigate } from '@tanstack/react-router';
import { originSearchOf } from '@/features/act-card/act-card-paths';
import type { ActPageSearch } from '@/features/acts/schemas';
import type { ScoreLink } from '../score-links';
import { editorLinkOf, playLinkOf } from '../score-links';
import { rememberStep } from '../score-memory';

export interface ScoreRoute {
  showStep: (stepId: number) => void;
  closeStep: () => void;
  openEdit: () => void;
  closeEdit: () => void;
  go: (link: ScoreLink) => void;
  practiseFrom: (stepId: number | null) => void;
  editFrom: (stepId: number | null) => void;
}

export const useScoreRoute = (
  actId: number,
  viewerId: number | null,
  search: ActPageSearch,
): ScoreRoute => {
  const navigate = useNavigate({ from: '/acts/$actId' });
  const patch = (change: Partial<ActPageSearch>): void => {
    void navigate({
      to: '.',
      search: (previous) => ({ ...previous, ...change }),
      replace: true,
      resetScroll: false,
    });
  };
  const go = (link: ScoreLink): void => {
    void navigate({ to: link.to, search: { ...originSearchOf(search), ...link.search } });
  };
  const goFrom = (link: ScoreLink, stepId: number | null): void => {
    if (stepId !== null) {
      rememberStep(actId, viewerId, stepId);
    }
    go(link);
  };

  return {
    showStep: (stepId) => {
      patch({ stepId });
    },
    closeStep: () => {
      patch({ stepId: undefined });
    },
    openEdit: () => {
      patch({ sheet: 'edit' });
    },
    closeEdit: () => {
      patch({ sheet: undefined });
    },
    go,
    practiseFrom: (stepId) => {
      goFrom(playLinkOf(actId), stepId);
    },
    editFrom: (stepId) => {
      goFrom(editorLinkOf(actId), stepId);
    },
  };
};
