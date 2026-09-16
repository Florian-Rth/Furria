import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KkChrome } from '../../../internal/KkChrome';
import { kkTokens } from '../../../tokens';
import { useKkShell } from '../logic/shell-context';
import { KkShellNavItem } from './KkShellNavItem';

const { navHeight } = kkTokens.shell;
const NAV_LABEL = 'Bereiche';
const NAV_DENSITY = 1;
const NAV_PADDING_X = 0.5;
const NO_INSET = 0;

interface KkShellNavProps {
  section: string;
}

export const KkShellNav: FC<KkShellNavProps> = ({ section }) => {
  const { destinations, keyboardInset } = useKkShell();

  if (keyboardInset > NO_INSET) {
    return null;
  }

  const items = destinations.map((destination) => (
    <KkShellNavItem
      key={destination.id}
      destination={destination}
      active={destination.id === section}
    />
  ));

  return (
    <KkChrome density={NAV_DENSITY} sx={{ height: `${navHeight}px`, px: NAV_PADDING_X }}>
      <Stack
        component="nav"
        aria-label={NAV_LABEL}
        direction="row"
        sx={{ flex: 1, alignItems: 'stretch', minWidth: 0 }}
      >
        {items}
      </Stack>
    </KkChrome>
  );
};
