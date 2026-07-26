import { changelogCopy } from '@/features/changelog/changelog-copy';

export const CHANGELOG_DIALOG_TITLE_ID = 'changelog-dialog-title';

export const CHANGELOG_DIALOG_DESCRIPTION_ID = 'changelog-dialog-description';

export const buildTabId = (entryId: string): string => `changelog-tab-${entryId}`;

export const buildPanelId = (entryId: string): string => `changelog-panel-${entryId}`;

export const buildTriggerLabel = (unreadCount: number): string =>
  unreadCount === 0
    ? changelogCopy.triggerAction
    : `${changelogCopy.triggerAction} (${unreadCount} neu)`;
