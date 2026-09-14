import { KkNote } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode, Ref } from 'react';
import { AppListColumns } from './AppListColumns';

const PHONE_ONLY_NOTE = { xs: 'flex', desktop: 'none' };

interface AppListLayoutProps {
  asideNote?: string;
  sectionTitle: string;
  createAction?: ReactNode;
  toolbar?: ReactNode;
  letterRail?: ReactNode;
  list: ReactNode;
  footnote?: string;
  aside?: ReactNode;
  asideSize?: number;
  asideDesktopOnly?: boolean;
  asideRef?: Ref<HTMLDivElement>;
  stickyList?: boolean;
  stickyAside?: boolean;
  asideLeadsFocus?: boolean;
}

export const AppListLayout: FC<AppListLayoutProps> = ({
  asideNote,
  sectionTitle,
  createAction,
  toolbar,
  letterRail,
  list,
  footnote,
  aside,
  asideSize,
  asideDesktopOnly,
  asideRef,
  stickyList,
  stickyAside,
  asideLeadsFocus,
}) => {
  const asideNoteLine =
    asideNote === undefined ? undefined : (
      <Stack sx={{ display: PHONE_ONLY_NOTE, minWidth: 0 }}>
        <KkNote>{asideNote}</KkNote>
      </Stack>
    );

  const footnoteLine = footnote === undefined ? null : <KkNote>{footnote}</KkNote>;

  return (
    <AppListColumns
      note={asideNoteLine}
      sectionTitle={sectionTitle}
      createAction={createAction}
      toolbar={toolbar}
      letterRail={letterRail}
      list={list}
      footnote={footnoteLine}
      aside={aside}
      asideSize={asideSize}
      asideDesktopOnly={asideDesktopOnly}
      asideRef={asideRef}
      stickyList={stickyList}
      stickyAside={stickyAside}
      asideLeadsFocus={asideLeadsFocus}
    />
  );
};
