import { KkLead, KkNote, KkPanelHeader, KkStickyBar, KkStickyRail } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode, Ref } from 'react';

const FULL_WIDTH = 12;
const DEFAULT_ASIDE_SIZE = 4;
const DESKTOP_ONLY_ACTION = { xs: 'none', desktop: 'flex' };
const DESKTOP_ONLY_COLUMN = { xs: 'none', desktop: 'block' };
const DETAIL_SCROLL_MARGIN = 2;

type ManagePageStickyColumn = 'main' | 'aside';

interface ManagePageLayoutProps {
  lead: string;
  sectionTitle: string;
  createAction?: ReactNode;
  toolbar?: ReactNode;
  list: ReactNode;
  footnote?: string;
  aside?: ReactNode;
  asideSize?: number;
  asideDesktopOnly?: boolean;
  asideRef?: Ref<HTMLDivElement>;
  stickyColumn?: ManagePageStickyColumn;
}

export const ManagePageLayout: FC<ManagePageLayoutProps> = ({
  lead,
  sectionTitle,
  createAction,
  toolbar,
  list,
  footnote,
  aside,
  asideSize = DEFAULT_ASIDE_SIZE,
  asideDesktopOnly = false,
  asideRef,
  stickyColumn = 'main',
}) => {
  const hasAside = aside !== undefined;
  const mainSize = hasAside ? FULL_WIDTH - asideSize : FULL_WIDTH;
  const sticksMain = hasAside && stickyColumn === 'main';
  const asideDisplay = asideDesktopOnly ? DESKTOP_ONLY_COLUMN : undefined;

  const action =
    createAction === undefined ? undefined : (
      <Stack sx={{ display: DESKTOP_ONLY_ACTION, flexShrink: 0 }}>{createAction}</Stack>
    );

  const toolbarBar = toolbar === undefined ? null : <KkStickyBar>{toolbar}</KkStickyBar>;
  const footnoteLine = footnote === undefined ? null : <KkNote>{footnote}</KkNote>;

  const main = (
    <Stack sx={{ gap: 1.5, minWidth: 0 }}>
      <KkPanelHeader title={sectionTitle} action={action} />
      {toolbarBar}
      {list}
    </Stack>
  );

  const mainBody = sticksMain ? <KkStickyRail>{main}</KkStickyRail> : main;
  const asideBody = stickyColumn === 'aside' ? <KkStickyRail>{aside}</KkStickyRail> : aside;

  const asideColumn = hasAside ? (
    <Grid
      ref={asideRef}
      size={{ xs: 12, desktop: asideSize }}
      sx={{ minWidth: 0, scrollMarginTop: DETAIL_SCROLL_MARGIN, display: asideDisplay }}
    >
      {asideBody}
    </Grid>
  ) : null;

  return (
    <Stack sx={{ gap: 3, minWidth: 0 }}>
      <KkLead>{lead}</KkLead>
      <Grid container spacing={{ xs: 3.5, desktop: 5 }} sx={{ minWidth: 0 }}>
        <Grid size={{ xs: 12, desktop: mainSize }} sx={{ minWidth: 0 }}>
          {mainBody}
        </Grid>
        {asideColumn}
      </Grid>
      {footnoteLine}
    </Stack>
  );
};
