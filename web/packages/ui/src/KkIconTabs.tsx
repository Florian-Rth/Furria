import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from './internal/focus-ring';
import { inkWashSurface } from './internal/ink-wash';
import { tapArea } from './internal/tap-area';
import type { KkIconName } from './KkIcon';
import { KkIcon } from './KkIcon';
import { kkTokens } from './tokens';

export interface KkIconTab {
  id: string;
  label: string;
  icon: KkIconName;
}

interface KkIconTabsProps {
  label: string;
  tabs: readonly KkIconTab[];
  value: string;
  onChange: (id: string) => void;
}

const tabPaint =
  (selected: boolean) =>
  (theme: Theme): CSSObject => ({
    width: '2.25rem',
    height: '2.25rem',
    borderRadius: `${kkTokens.radius.base}px`,
    color: selected ? 'text.primary' : 'text.secondary',
    ...(selected ? inkWashSurface(theme, '8%', '14%') : {}),
    ...focusRing(theme),
    ...tapArea(),
    '@media (hover: hover)': {
      '&:hover': { color: 'text.primary' },
    },
  });

export const KkIconTabs: FC<KkIconTabsProps> = ({ label, tabs, value, onChange }) => {
  const items = tabs.map((tab) => {
    const selected = tab.id === value;
    const choose = (): void => {
      onChange(tab.id);
    };

    return (
      <ButtonBase
        key={tab.id}
        role="tab"
        aria-selected={selected}
        aria-label={tab.label}
        title={tab.label}
        onClick={choose}
        sx={tabPaint(selected)}
      >
        <KkIcon name={tab.icon} size="small" />
      </ButtonBase>
    );
  });

  return (
    <Stack
      direction="row"
      role="tablist"
      aria-label={label}
      sx={{ gap: 0.25, flexShrink: 0, alignItems: 'center' }}
    >
      {items}
    </Stack>
  );
};
