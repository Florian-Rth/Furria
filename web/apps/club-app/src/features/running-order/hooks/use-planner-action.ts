import type { KkScreenDeed } from '@furria/ui/screen-declaration';
import { unplacedLinesOf } from '@/features/running-order/running-order-ops';
import {
  ACCEPT_ALL_LABEL,
  AUTO_ORDER_LABEL,
  BACK_LABEL,
  CONFIRM_HINT,
  CONFIRM_LABEL,
  CONFIRM_QUESTION,
  DISCARD_LABEL,
  REOPEN_LABEL,
  SEARCH_ON_LABEL,
  SEARCH_STOP_LABEL,
  SUGGEST_LABEL,
  TAKE_NOW_LABEL,
  toNextModeLabel,
  toPickedContext,
  toSearchNotice,
  toStepBlockText,
  toWishesToolLabel,
} from '../planner-copy';
import type { FootForward, ModeTool, ProposalStage } from '../planner-modes';
import { footPlanOf, modeToolsOf, proposalStageOf } from '../planner-modes';
import type { PlannerMode } from '../schemas';
import type { RunningOrderPlanner } from './use-running-order-planner';

export interface PlannerFootView {
  notice: string | null;
  start: KkScreenDeed;
  end: KkScreenDeed;
}

export interface PlannerToolView {
  id: ModeTool;
  deed: KkScreenDeed;
  active: boolean;
}

export interface PlannerActions {
  foot: PlannerFootView | null;
  tools: PlannerToolView[];
}

const toolDeedOf = (planner: RunningOrderPlanner, tool: ModeTool): KkScreenDeed => {
  switch (tool) {
    case 'autoOrder':
      return {
        label: AUTO_ORDER_LABEL,
        icon: 'suggest',
        loading: planner.suggestion.isLoading,
        disabled: planner.counts.pick < 2,
        onSelect: planner.suggestion.request,
      };
    case 'wishes':
      return {
        label: toWishesToolLabel(planner.wishCount),
        icon: 'wish',
        onSelect: planner.wishesOpen && planner.isWide ? planner.closeWishes : planner.openWishes,
      };
    case 'suggest':
      return {
        label: SUGGEST_LABEL,
        icon: 'suggest',
        loading: planner.suggestion.isLoading,
        disabled: planner.counts.pick < 2,
        onSelect: planner.suggestion.request,
      };
    case 'searchOn':
      return {
        label: SEARCH_ON_LABEL,
        icon: 'suggest',
        onSelect: planner.suggestion.searchOn,
      };
  }
};

const stageOf = ({ suggestion }: RunningOrderPlanner): ProposalStage =>
  proposalStageOf(suggestion.isLoading, suggestion.isActive, suggestion.proven);

const forwardDeedOf = (
  planner: RunningOrderPlanner,
  forward: FootForward,
  blocked: boolean,
): KkScreenDeed => {
  const { store } = planner;

  switch (forward.kind) {
    case 'next':
      return {
        label: toNextModeLabel(forward.mode),
        disabled: blocked,
        onSelect: () => {
          planner.setMode(forward.mode);
        },
      };
    case 'confirm':
      return {
        label: CONFIRM_LABEL,
        hold: { hint: CONFIRM_HINT, confirm: CONFIRM_QUESTION },
        disabled: blocked || store.isConfirming,
        onSelect: () => {
          store.confirm(true);
        },
      };
    case 'reopen':
      return {
        label: REOPEN_LABEL,
        loading: store.isConfirming,
        onSelect: () => {
          store.confirm(false);
        },
      };
  }
};

const backDeedOf = (planner: RunningOrderPlanner, back: PlannerMode | null): KkScreenDeed => ({
  label: BACK_LABEL,
  disabled: back === null,
  onSelect: () => {
    if (back !== null) {
      planner.setMode(back);
    }
  },
});

const footOf = (planner: RunningOrderPlanner): PlannerFootView => {
  const { store, suggestion } = planner;
  const plan = footPlanOf({
    mode: planner.mode,
    proposal: stageOf(planner),
    confirmed: store.confirmedAt !== null && !store.changedSinceConfirmed,
    picked: planner.counts.pick,
    unplaced: unplacedLinesOf(planner.draft).length,
    conflicts: planner.tally.conflicts,
    saved: store.exists && !store.isDirty,
  });

  if (plan.kind === 'searching') {
    return {
      notice: toSearchNotice(suggestion.tally),
      start: { label: SEARCH_STOP_LABEL, onSelect: suggestion.cancel },
      end: {
        label: TAKE_NOW_LABEL,
        disabled: suggestion.tally === null,
        onSelect: suggestion.takeNow,
      },
    };
  }

  if (plan.kind === 'proposal') {
    return {
      notice: null,
      start: { label: DISCARD_LABEL, onSelect: suggestion.discard },
      end: {
        label: ACCEPT_ALL_LABEL,
        disabled: suggestion.isLoading,
        onSelect: suggestion.acceptAll,
      },
    };
  }

  const quietNotice = planner.mode === 'pick' ? toPickedContext(planner.counts.pick) : null;

  return {
    notice: plan.block === null ? quietNotice : toStepBlockText(plan.block),
    start: backDeedOf(planner, plan.back),
    end: forwardDeedOf(planner, plan.forward, plan.block !== null),
  };
};

export const usePlannerAction = (planner: RunningOrderPlanner): PlannerActions => {
  if (planner.store.isLoading || planner.store.loadError !== null) {
    return { foot: null, tools: [] };
  }

  return {
    foot: footOf(planner),
    tools: modeToolsOf(planner.mode, stageOf(planner)).map((tool) => ({
      id: tool,
      deed: toolDeedOf(planner, tool),
      active: tool === 'wishes' && planner.wishesOpen && planner.isWide,
    })),
  };
};
