import type { ReactNode } from 'react';
import type { KkTone } from '../internal/tone';
import type { KkIconName } from '../KkIcon';
import type { KkLetterIndexEntry } from '../letter-index-cells';
import type { KkLetterPace } from '../letter-pace';
import type { KkHandoverStage } from './handover-stage';

export type KkScreenKind = 'overview' | 'list' | 'detail' | 'working' | 'fullscreen';

export type KkScreenHeaderKind = 'title' | 'banner';

export interface KkScreenOrigin {
  label: string;
  to: string;
  params?: Record<string, string>;
}

interface KkScreenActionBase {
  id: string;
  label: string;
  icon: KkIconName;
  onSelect: () => void;
}

export interface KkQuietScreenAction extends KkScreenActionBase {
  emphasis?: false;
}

export interface KkLoudScreenAction extends KkScreenActionBase {
  emphasis: true;
}

export type KkScreenAction = KkQuietScreenAction | KkLoudScreenAction;

export type KkScreenActions =
  | readonly [KkQuietScreenAction]
  | readonly [KkLoudScreenAction]
  | readonly [KkQuietScreenAction, KkQuietScreenAction]
  | readonly [KkQuietScreenAction, KkLoudScreenAction]
  | readonly [KkLoudScreenAction, KkQuietScreenAction];

export type KkScreenActionTone = 'quiet' | 'consequence';

export interface KkScreenActionContext {
  text: string;
  tone: KkScreenActionTone;
}

export type KkScreenDeedTone = 'danger';

export interface KkScreenDeed {
  label: string;
  onSelect: () => void;
  icon?: KkIconName;
  tone?: KkScreenDeedTone;
  loading?: boolean;
  disabled?: boolean;
}

export interface KkScreenActionBar {
  context?: string | KkScreenActionContext;
  primary: KkScreenDeed;
  secondary?: KkScreenDeed;
}

export type KkScreenThreadTone = Exclude<KkTone, 'ink'>;

export interface KkScreenIndex {
  label: string;
  letters: readonly KkLetterIndexEntry[];
  current?: string;
  onSelect: (letter: string, pace: KkLetterPace) => void;
}

export interface KkScreenThread {
  value: number;
  tone: KkScreenThreadTone;
  label: string;
}

export interface KkScreenSearch {
  query: string | null;
  placeholder: string;
  openLabel: string;
  cancelLabel: string;
  onOpen: () => void;
  onChange: (query: string) => void;
  onClose: () => void;
}

interface KkScreenShared {
  title: string;
  header?: ReactNode;
  headerKind?: KkScreenHeaderKind;
  thread?: KkScreenThread;
  handover?: KkHandoverStage;
  children?: ReactNode;
}

interface KkSearchingScreen {
  search: KkScreenSearch;
  actions?: readonly [KkScreenAction];
}

interface KkUnsearchableScreen {
  search?: never;
  actions?: KkScreenActions;
}

type KkScreenTrailing = KkSearchingScreen | KkUnsearchableScreen;

interface KkRootScreen extends KkScreenShared {
  section: string;
  origin?: never;
}

interface KkNestedScreen extends KkScreenShared {
  section?: never;
  origin?: KkScreenOrigin;
}

interface KkOverviewScreen extends KkRootScreen {
  kind: 'overview';
  tools?: never;
  action?: never;
  index?: never;
}

interface KkRootListScreen extends KkRootScreen {
  kind: 'list';
  tools?: ReactNode;
  action?: never;
  index?: KkScreenIndex;
}

interface KkNestedListScreen extends KkNestedScreen {
  kind: 'list';
  tools?: ReactNode;
  action?: never;
  index?: KkScreenIndex;
}

interface KkDetailScreen extends KkNestedScreen {
  kind: 'detail';
  tools?: never;
  action?: KkScreenActionBar;
  index?: never;
}

interface KkWorkingScreen extends KkNestedScreen {
  kind: 'working';
  tools?: ReactNode;
  action?: KkScreenActionBar;
  index?: never;
}

interface KkFullscreenScreen extends KkScreenShared {
  kind: 'fullscreen';
  section?: never;
  origin: KkScreenOrigin;
  search?: never;
  actions?: never;
  tools?: never;
  action?: KkScreenActionBar;
  index?: never;
}

type KkNarrowableScreen = KkRootListScreen | KkNestedListScreen | KkWorkingScreen;

export type KkScreenProps =
  | ((KkOverviewScreen | KkDetailScreen) & KkUnsearchableScreen)
  | (KkNarrowableScreen & KkScreenTrailing)
  | KkFullscreenScreen;
