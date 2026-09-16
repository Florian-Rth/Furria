export { KkNoticeProvider } from './internal/logic/KkNoticeProvider';
export type {
  KkNoticeAction,
  KkNoticeActions,
  KkNoticeLabels,
  KkNoticeRequest,
  KkNoticeTone,
  KkSystemNotice,
} from './notice-declaration';
export type { KkNoticePublisher } from './notice-store';
export { useKkNotice } from './notice-store';
