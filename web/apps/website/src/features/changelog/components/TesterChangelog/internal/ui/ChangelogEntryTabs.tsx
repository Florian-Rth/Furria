import { kkTokens } from '@furria/ui';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import type { FC } from 'react';
import { changelogCopy } from '@/features/changelog/changelog-copy';
import type { ChangelogEntry } from '@/features/changelog/schemas';
import { buildPanelId, buildTabId } from '../logic/changelog-dialog-a11y';
import { ChangelogTabLabel } from './ChangelogTabLabel';

interface ChangelogEntryTabsProps {
  entries: ChangelogEntry[];
  selectedEntryId: string;
  isUnread: (entryId: string) => boolean;
  onSelect: (entryId: string) => void;
}

export const ChangelogEntryTabs: FC<ChangelogEntryTabsProps> = ({
  entries,
  selectedEntryId,
  isUnread,
  onSelect,
}) => (
  <Tabs
    orientation="vertical"
    variant="scrollable"
    value={selectedEntryId}
    aria-label={changelogCopy.tabsLabel}
    sx={{
      maxHeight: { desktop: '26rem' },
      '& .MuiTabs-indicator': { left: 0, right: 'auto', width: '0.1875rem' },
    }}
  >
    {entries.map((entry) => (
      <Tab
        key={entry.id}
        value={entry.id}
        id={buildTabId(entry.id)}
        aria-controls={buildPanelId(entry.id)}
        onClick={() => onSelect(entry.id)}
        label={<ChangelogTabLabel entry={entry} unread={isUnread(entry.id)} />}
        sx={(theme) => ({
          minHeight: '2.75rem',
          maxWidth: 'none',
          alignItems: 'flex-start',
          textAlign: 'left',
          pl: 2,
          pr: 1.5,
          py: 1.5,
          borderRadius: `${kkTokens.radius.base}px`,
          '&.Mui-focusVisible': {
            outlineWidth: 2,
            outlineStyle: 'solid',
            outlineColor: (theme.vars ?? theme).palette.primary.main,
            outlineOffset: -2,
          },
        })}
      />
    ))}
  </Tabs>
);
