import { KkStickyBar, KkStickyRail } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode, Ref } from 'react';
import { AppListSectionHead } from './AppListSectionHead';

const FULL_WIDTH = 12;
const DEFAULT_ASIDE_SIZE = 4;
const DESKTOP_ONLY_COLUMN = { xs: 'none', desktop: 'block' };
const PHONE_ONLY_RAIL = { xs: 'flex', desktop: 'none' };
const DETAIL_SCROLL_MARGIN = 2;
const LIST_VISUAL_ORDER = 1;
const ASIDE_VISUAL_ORDER = 2;

export interface AppListColumnsProps {
  lead?: ReactNode;
  sectionTitle: string;
  createAction?: ReactNode;
  toolbar?: ReactNode;
  letterRail?: ReactNode;
  list: ReactNode;
  footnote?: ReactNode;
  aside?: ReactNode;
  asideSize?: number;
  asideDesktopOnly?: boolean;
  asideRef?: Ref<HTMLDivElement>;
  stickyList?: boolean;
  stickyAside?: boolean;
  asideLeadsFocus?: boolean;
}

export const AppListColumns: FC<AppListColumnsProps> = ({
  lead,
  sectionTitle,
  createAction,
  toolbar,
  letterRail,
  list,
  footnote,
  aside,
  asideSize = DEFAULT_ASIDE_SIZE,
  asideDesktopOnly = false,
  asideRef,
  stickyList = false,
  stickyAside = false,
  asideLeadsFocus = false,
}) => {
  const hasAside = aside !== undefined;
  const mainSize = hasAside ? FULL_WIDTH - asideSize : FULL_WIDTH;
  const asideDisplay = asideDesktopOnly ? DESKTOP_ONLY_COLUMN : undefined;
  const mainOrder = asideLeadsFocus ? LIST_VISUAL_ORDER : undefined;
  const asideOrder = asideLeadsFocus ? ASIDE_VISUAL_ORDER : undefined;

  const toolbarBar = toolbar === undefined ? null : <KkStickyBar>{toolbar}</KkStickyBar>;
  const asideBody = stickyAside ? <KkStickyRail>{aside}</KkStickyRail> : aside;

  const railBand =
    letterRail === undefined ? null : (
      <Stack sx={{ display: PHONE_ONLY_RAIL, minWidth: 0 }}>{letterRail}</Stack>
    );

  const mainBody = (
    <Stack sx={{ gap: 1.5, minWidth: 0 }}>
      <AppListSectionHead title={sectionTitle} action={createAction} />
      {toolbarBar}
      {list}
    </Stack>
  );

  const mainColumn = (
    <Grid key="main" size={{ xs: 12, desktop: mainSize }} sx={{ minWidth: 0, order: mainOrder }}>
      {stickyList ? <KkStickyRail>{mainBody}</KkStickyRail> : mainBody}
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
      {lead}
      <Grid container spacing={{ xs: 3.5, desktop: 5 }} sx={{ minWidth: 0 }}>
        {columns}
      </Grid>
      {footnote}
      {railBand}
    </Stack>
  );
};
