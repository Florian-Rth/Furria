import type {
  KkPressLineTone,
  KkPressToggleOption,
  KkReadinessSlot,
  KkRegisterMarkState,
} from '@furria/ui';
import { useIsMobile } from '@furria/ui';
import {
  DELETE,
  DISCARD,
  FOREIGN_SAVE,
  PUBLISH_AGAIN,
  PUBLISH_CHANGES,
  PUBLISH_FIRST,
  SAVE_FAILED,
  SAVED_AT,
  SAVING,
  SHOW_LIVE,
  SHOW_WORKING,
  WITHDRAW,
} from '../editor-copy';
import { MANAGING_LOGIN_NAME, REQUIREMENT_WORDS, STAGE_WORDS } from '../news-copy';
import { timeOf } from '../news-dates';
import { revealNewsField } from '../news-fields';
import type { PressLine, SecondaryAction } from '../press-bar-facts';
import {
  lineToneOf,
  pressLineOf,
  REGISTER_STATES,
  readinessSlotsOf,
  SECONDARY_ACTIONS,
  shownStageOf,
  showsReadiness,
} from '../press-bar-facts';
import {
  LINE_MISSING,
  LINE_PUBLISHING,
  LINE_SINCE,
  LINE_VIEW_ONLY,
  LIVE_VERSION_WORD,
  PUBLISH_SHORT,
  SHOW_LIVE_ITEM,
  SHOW_WORKING_ITEM,
} from '../press-copy';
import type { PressKind } from '../press-run';
import { isPressBusy, pressKindOf, pressMomentOf } from '../press-run';
import type { NewsRequirement, NewsStage } from '../types';
import type { NewsEditor } from './use-news-editor';
import type { ProseText } from './use-prose-text';

export interface PressFootAction {
  id: string;
  label: string;
  tone: 'default' | 'danger';
  disabled: boolean;
  onSelect: () => void;
}

export interface PressFootToggle {
  value: string;
  options: readonly KkPressToggleOption[];
  onChange: (id: string) => void;
}

export interface PressFoot {
  isRailOnly: boolean;
  isBlocked: boolean;
  markState: KkRegisterMarkState;
  stateWord: string;
  line: string;
  lineTone: KkPressLineTone;
  foreignNote: string | undefined;
  readiness: KkReadinessSlot[] | null;
  selectRequirement: (id: string) => void;
  toggle: PressFootToggle | null;
  inlineActions: readonly PressFootAction[];
  menuActions: readonly PressFootAction[];
  publishLabel: string | null;
  pressKind: PressKind;
}

const PUBLISH_LABELS: Record<NewsStage, string | null> = {
  draft: PUBLISH_FIRST,
  live: null,
  pending: PUBLISH_CHANGES,
  withdrawn: PUBLISH_AGAIN,
};

const ACTION_LABELS: Record<SecondaryAction, string> = {
  discard: DISCARD,
  withdraw: WITHDRAW,
  delete: DELETE,
};

const LIVE_VIEW = 'live';
const WORKING_VIEW = 'working';

const TOGGLE_OPTIONS: readonly KkPressToggleOption[] = [
  { id: WORKING_VIEW, label: SHOW_WORKING },
  { id: LIVE_VIEW, label: SHOW_LIVE },
];

const lineTextOf = (line: PressLine): string => {
  switch (line.kind) {
    case 'publishing':
      return LINE_PUBLISHING;
    case 'saving':
      return SAVING;
    case 'failed':
      return SAVE_FAILED;
    case 'viewOnly':
      return LINE_VIEW_ONLY;
    case 'missing':
      return missingLineOf(line.missing);
    case 'saved':
      return line.at === null ? '' : `${SAVED_AT} ${timeOf(line.at)}`;
    case 'liveSince':
    case 'withdrawnAt':
      return `${LINE_SINCE} ${pressMomentOf(line.at)}`;
  }
};

const missingLineOf = (missing: readonly NewsRequirement[]): string => {
  const [first, ...rest] = missing;
  const head = first === undefined ? '' : REQUIREMENT_WORDS[first];
  return rest.length === 0
    ? `${LINE_MISSING}: ${head}`
    : `${LINE_MISSING}: ${head} +${rest.length}`;
};

export const usePressFoot = (editor: NewsEditor, text: ProseText): PressFoot => {
  const isCompact = useIsMobile();
  const { foreignSave, press, post } = editor;
  const isBusy = isPressBusy(press.phase);
  const stage = shownStageOf(editor.stage, press.kind, isBusy);
  const showsLive = editor.showsLive && stage === 'pending';
  const line = pressLineOf({
    stage,
    save: editor.saveStatus,
    savedAt: editor.savedAt,
    publishedAt: post?.publishedAt ?? null,
    withdrawnAt: post?.withdrawnAt ?? null,
    missing: editor.missing,
    isBusy,
    showsLive,
    isCompact,
  });
  const isBlocked = editor.isGone || isBusy;
  const dialogActions = SECONDARY_ACTIONS[stage].map(
    (action): PressFootAction => ({
      id: action,
      label: ACTION_LABELS[action],
      tone: action === 'discard' ? 'default' : 'danger',
      disabled: isBlocked || (action === 'delete' && editor.postId === null),
      onSelect: () => {
        editor.openDialog(action);
      },
    }),
  );
  const viewAction: PressFootAction[] =
    stage === 'pending'
      ? [
          {
            id: 'view',
            label: showsLive ? SHOW_WORKING_ITEM : SHOW_LIVE_ITEM,
            tone: 'default',
            disabled: isBusy,
            onSelect: editor.toggleLive,
          },
        ]
      : [];
  const publishLabel = PUBLISH_LABELS[stage];
  const collapses = isCompact && publishLabel !== null;
  const compactLabel = publishLabel === null ? null : PUBLISH_SHORT;

  return {
    isRailOnly: isCompact && text.hasFocus,
    isBlocked,
    markState: showsLive ? REGISTER_STATES.live : REGISTER_STATES[stage],
    stateWord: showsLive ? LIVE_VERSION_WORD : STAGE_WORDS[stage],
    line: lineTextOf(line),
    lineTone: lineToneOf(line),
    foreignNote:
      foreignSave === null
        ? undefined
        : FOREIGN_SAVE(foreignSave.name ?? MANAGING_LOGIN_NAME, timeOf(foreignSave.at)),
    readiness: showsReadiness(stage, editor.missing.length)
      ? readinessSlotsOf(editor.missing, REQUIREMENT_WORDS)
      : null,
    selectRequirement: revealNewsField,
    toggle:
      stage === 'pending' && !isCompact
        ? {
            value: showsLive ? LIVE_VIEW : WORKING_VIEW,
            options: TOGGLE_OPTIONS,
            onChange: (id) => {
              if ((id === LIVE_VIEW) !== showsLive) {
                editor.toggleLive();
              }
            },
          }
        : null,
    inlineActions: collapses ? [] : dialogActions,
    menuActions: collapses ? [...viewAction, ...dialogActions] : [],
    publishLabel: isCompact ? compactLabel : publishLabel,
    pressKind: pressKindOf(stage),
  };
};
