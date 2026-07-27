import type { FC } from 'react';
import { ChangelogDialogBody } from './internal/layout/ChangelogDialogBody';
import { ChangelogPanelColumn } from './internal/layout/ChangelogPanelColumn';
import { ChangelogTabColumn } from './internal/layout/ChangelogTabColumn';
import { ChangelogTriggerAnchor } from './internal/layout/ChangelogTriggerAnchor';
import { useChangelogDialog } from './internal/logic/use-changelog-dialog';
import { ChangelogBackButton } from './internal/ui/ChangelogBackButton';
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
    mobileView,
    isUnread,
    selectEntry,
    showEntryList,
    openDialog,
    closeDialog,
  } = useChangelogDialog();

  if (selectedEntry === undefined) {
    return null;
  }

  const showingEntryList = mobileView === 'list';

  return (
    <>
      <ChangelogTriggerAnchor>
        <ChangelogTriggerPill unreadCount={unreadCount} onOpen={openDialog} />
      </ChangelogTriggerAnchor>
      <ChangelogDialog open={open} onClose={closeDialog}>
        <ChangelogDialogBody>
          <ChangelogTabColumn
            sx={{ display: { xs: showingEntryList ? 'block' : 'none', desktop: 'block' } }}
          >
            <ChangelogEntryTabs
              entries={entries}
              selectedEntryId={selectedEntry.id}
              isUnread={isUnread}
              onSelect={selectEntry}
            />
          </ChangelogTabColumn>
          <ChangelogPanelColumn
            sx={{ display: { xs: showingEntryList ? 'none' : 'flex', desktop: 'flex' } }}
          >
            <ChangelogBackButton onBack={showEntryList} />
            <ChangelogEntryPanel entry={selectedEntry} />
          </ChangelogPanelColumn>
        </ChangelogDialogBody>
      </ChangelogDialog>
    </>
  );
};
