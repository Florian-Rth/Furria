import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import type { FC, SyntheticEvent } from 'react';
import type { KkAnswerRollTone } from '../../../KkAnswerRoll/internal/answer-roll-tone';
import { KkNamesSheetTabLabel } from './KkNamesSheetTabLabel';

export interface KkNamesSheetTab {
  id: string;
  label: string;
  count: number;
  tone?: KkAnswerRollTone;
}

interface KkNamesSheetTabsProps {
  label: string;
  tabs: readonly KkNamesSheetTab[];
  value: string;
  onChange: (id: string) => void;
}

export const KkNamesSheetTabs: FC<KkNamesSheetTabsProps> = ({ label, tabs, value, onChange }) => {
  const change = (_event: SyntheticEvent, id: string): void => {
    onChange(id);
  };
  const items = tabs.map((tab) => (
    <Tab
      key={tab.id}
      value={tab.id}
      label={<KkNamesSheetTabLabel label={tab.label} count={tab.count} tone={tab.tone} />}
      sx={{ minWidth: 0, px: 1.5, textTransform: 'none' }}
    />
  ));

  return (
    <Tabs
      value={value}
      onChange={change}
      aria-label={label}
      variant="scrollable"
      scrollButtons={false}
      data-kk-names-sheet-tabs
      sx={{ minHeight: 0, mx: -1 }}
    >
      {items}
    </Tabs>
  );
};
