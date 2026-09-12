import { KkLead, KkNote, KkPanelHeader, KkStickyBar, KkStickyRail } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode, Ref } from 'react';

const FULL_WIDTH = 12;
const DEFAULT_ASIDE_SIZE = 4;
const DESKTOP_ONLY_ACTION = { xs: 'none', desktop: 'flex' };
const DESKTOP_ONLY_COLUMN = { xs: 'none', desktop: 'block' };
const DETAIL_SCROLL_MARGIN = 2;
const LIST_VISUAL_ORDER = 1;
const ASIDE_VISUAL_ORDER = 2;

interface AppListLayoutProps {
  lead: string;
  subLead?: ReactNode;
  sectionTitle: string;
  createAction?: ReactNode;
  toolbar?: ReactNode;
  list: ReactNode;
  footnote?: string;
  aside?: ReactNode;
  asideSize?: number;
  asideDesktopOnly?: boolean;
  asideRef?: Ref<HTMLDivElement>;
  stickyAside?: boolean;
  asideLeadsFocus?: boolean;
}

export const AppListLayout: FC<AppListLayoutProps> = ({
  lead,
  subLead,
  sectionTitle,
  createAction,
  toolbar,
  list,
  footnote,
  aside,
  asideSize = DEFAULT_ASIDE_SIZE,
  asideDesktopOnly = false,
  asideRef,
  stickyAside = false,
  asideLeadsFocus = false,
}) => {
  const hasAside = aside !== undefined;
  const mainSize = hasAside ? FULL_WIDTH - asideSize : FULL_WIDTH;
  const asideDisplay = asideDesktopOnly ? DESKTOP_ONLY_COLUMN : undefined;
  const mainOrder = asideLeadsFocus ? LIST_VISUAL_ORDER : undefined;
  const asideOrder = asideLeadsFocus ? ASIDE_VISUAL_ORDER : undefined;

  const action =
    createAction === undefined ? undefined : (
      <Stack sx={{ display: DESKTOP_ONLY_ACTION, flexShrink: 0 }}>{createAction}</Stack>
    );

  const toolbarBar = toolbar === undefined ? null : <KkStickyBar>{toolbar}</KkStickyBar>;
  const footnoteLine = footnote === undefined ? null : <KkNote>{footnote}</KkNote>;
  const asideBody = stickyAside ? <KkStickyRail>{aside}</KkStickyRail> : aside;

  const mainColumn = (
    <Grid key="main" size={{ xs: 12, desktop: mainSize }} sx={{ minWidth: 0, order: mainOrder }}>
      <Stack sx={{ gap: 1.5, minWidth: 0 }}>
        <KkPanelHeader title={sectionTitle} action={action} />
        {toolbarBar}
        {list}
      </Stack>
    </Grid>
  );

  const asideColumn = hasAside ? (
    <Grid
      key="aside"
      ref={asideRef}
      size={{ xs: 12, desktop: asideSize }}
      sx={{
        minWidth: 0,
        scrollMarginTop: DETAIL_SCROLL_MARGIN,
        display: asideDisplay,
        order: asideOrder,
      }}
    >
      {asideBody}
    </Grid>
  ) : null;

  const columns = asideLeadsFocus ? [asideColumn, mainColumn] : [mainColumn, asideColumn];

  return (
    <Stack sx={{ gap: 3, minWidth: 0 }}>
      <Stack sx={{ gap: 1, minWidth: 0 }}>
        <KkLead>{lead}</KkLead>
        {subLead}
      </Stack>
      <Grid container spacing={{ xs: 3.5, desktop: 5 }} sx={{ minWidth: 0 }}>
        {columns}
      </Grid>
      {footnoteLine}
    </Stack>
  );
};
