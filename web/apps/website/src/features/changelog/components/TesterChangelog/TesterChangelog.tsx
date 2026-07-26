import type { FC } from 'react';
import { ChangelogDialogBody } from './internal/layout/ChangelogDialogBody';
import { ChangelogPanelColumn } from './internal/layout/ChangelogPanelColumn';
import { ChangelogTabColumn } from './internal/layout/ChangelogTabColumn';
import { ChangelogTriggerAnchor } from './internal/layout/ChangelogTriggerAnchor';
import { useChangelogDialog } from './internal/logic/use-changelog-dialog';
import { ChangelogDialog } from './internal/ui/ChangelogDialog';
import { ChangelogEntryPanel } from './internal/ui/ChangelogEntryPanel';
import { ChangelogEntryTabs } from './internal/ui/ChangelogEntryTabs';
import { ChangelogTriggerPill } from './internal/ui/ChangelogTriggerPill';

export const TesterChangelog: FC = () => {
  const {
    entries,
    unreadCount,
    open,
    selectedEntry,
    isUnread,
    selectEntry,
    openDialog,
    closeDialog,
  } = useChangelogDialog();

  if (selectedEntry === undefined) {
    return null;
  }

  return (
    <>
      <ChangelogTriggerAnchor>
        <ChangelogTriggerPill unreadCount={unreadCount} onOpen={openDialog} />
      </ChangelogTriggerAnchor>
      <ChangelogDialog open={open} onClose={closeDialog}>
        <ChangelogDialogBody>
          <ChangelogTabColumn>
            <ChangelogEntryTabs
              entries={entries}
              selectedEntryId={selectedEntry.id}
              isUnread={isUnread}
              onSelect={selectEntry}
            />
          </ChangelogTabColumn>
          <ChangelogPanelColumn>
            <ChangelogEntryPanel entry={selectedEntry} />
          </ChangelogPanelColumn>
        </ChangelogDialogBody>
      </ChangelogDialog>
    </>
  );
};
