import type { ReactNode } from 'react';
import type { KkTone } from '../internal/tone';
import type { KkIconName } from '../KkIcon';

export type KkScreenKind = 'overview' | 'list' | 'detail' | 'working' | 'fullscreen';

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

export type KkScreenThreadTone = Exclude<KkTone, 'ink'>;

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
  thread?: KkScreenThread;
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
}

interface KkRootListScreen extends KkRootScreen {
  kind: 'list';
  tools?: ReactNode;
}

interface KkNestedListScreen extends KkNestedScreen {
  kind: 'list';
  tools?: ReactNode;
}

interface KkDetailScreen extends KkNestedScreen {
  kind: 'detail';
  tools?: never;
}

interface KkWorkingScreen extends KkNestedScreen {
  kind: 'working';
  tools?: ReactNode;
}

interface KkFullscreenScreen extends KkScreenShared {
  kind: 'fullscreen';
  section?: never;
  origin: KkScreenOrigin;
  search?: never;
  actions?: never;
  tools?: never;
}

type KkNarrowableScreen = KkRootListScreen | KkNestedListScreen | KkWorkingScreen;

export type KkScreenProps =
  | ((KkOverviewScreen | KkDetailScreen) & KkUnsearchableScreen)
  | (KkNarrowableScreen & KkScreenTrailing)
  | KkFullscreenScreen;
