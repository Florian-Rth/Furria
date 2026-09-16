import type { KkIconName } from '../KkIcon';

export type KkNoticeTone = 'success' | 'error' | 'info';

export interface KkNoticeAction {
  id: string;
  label: string;
  onSelect: () => void;
}

export type KkNoticeActions = readonly [KkNoticeAction] | readonly [KkNoticeAction, KkNoticeAction];

export interface KkNoticeRequest {
  tone: KkNoticeTone;
  message: string;
  icon?: KkIconName;
  detail?: readonly string[];
  actions?: KkNoticeActions;
}

export interface KkSystemNotice extends KkNoticeRequest {
  id: string;
}

export interface KkNoticeLabels {
  dismiss: string;
  expand: string;
  collapse: string;
}
